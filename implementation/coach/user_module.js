const common_func = require("../commonFunc");
const userValidation = require("../services/userValidations/userValidationService")
const constants = require("../../constants")


async function insertSportsmanDB(trans, users, sportsmanDetails, i) {
    return trans.sql(` INSERT INTO user_Sportsman (id, firstname, lastname, phone, email, birthdate, address, sportclub, sex,photo)
                                    VALUES (@idSportsman, @firstName, @lastName, @phone, @email, @birthDate, @address, @sportClub, @sex ,@photo)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.idSportsman])
        .parameter('firstName', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.firstName])
        .parameter('lastName', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.lastName])
        .parameter('phone', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.phone])
        .parameter('address', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.address])
        .parameter('birthDate', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.birthDate])
        .parameter('email', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.email])
        .parameter('sportClub', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.sportClub])
        .parameter('sex', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.sex])
        .parameter('photo', tediousTYPES.NVarChar, constants.defaultProfilePic)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertSportsmanDB(trans, users, users[i + 1], i + 1);
            return testResult
        })

}

async function insertPasswordDB(trans, users, userDetails, i, userType) {
    return trans.sql(`INSERT INTO user_Passwords (id,password,isfirstlogin)
                      select * from (select @idUser as id, @password as password ,@isFirstLogin as isfirstlogin)
                      as tmp where not exists( select id,password,isfirstlogin from user_Passwords where id= @idUser);
                      insert into user_UserTypes (id, usertype) values (@idUser ,@userType);`)
        .parameter('idUser', tediousTYPES.Int, userDetails[constants.colRegisterSportsmanExcel.idSportsman])
        .parameter('password', tediousTYPES.NVarChar, bcrypt.hashSync(userDetails[constants.colRegisterSportsmanExcel.idSportsman].toString(), saltRounds))
        .parameter('userType', tediousTYPES.Int, userType)
        .parameter('isFirstLogin', tediousTYPES.Int, 1)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertPasswordDB(trans, users, users[i + 1], (i + 1), userType)
            return testResult
        })
}

/**
 * register new sportsmen to the system, supports manual registration of one sportsman and also excel registration
 * @param users - list of users to register
 * @return {status, results} - result contains successful message or errors
 */
async function registerSportsman(users) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await insertSportsmanDB(trans, users, users[0], 0), await insertPasswordDB(trans, users, users[0], 0, constants.userType.SPORTSMAN), await insertCoachDB(trans, users, users[0], 0), await insertSportStyleDB(trans, users, users[0], 0)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.registerSuccess;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = constants.statusCode.badRequest;
                    ans.results = err;
                    console.log(err)

                    trans.rollbackTransaction();

                }))
        })
        .fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            console.log(err)

            trans.rollbackTransaction();
        })

    return ans
}

async function insertCoachDB(trans, users, sportsmanDetails, i) {
    return trans.sql(`INSERT INTO sportsman_coach (idSportman,idCoach)
                    Values (@idSportsman,@idCoach)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.idSportsman])
        .parameter('idCoach', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.idCoach])
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertCoachDB(trans, users, users[i + 1], (i + 1))
            return testResult
        })
}

async function insertSportStyleDB(trans, users, sportsmanDetails, i) {
    return trans.sql(`INSERT INTO sportsman_sportStyle (id, taullo,sanda)
                    Values (@idSportsman,@taullo ,@sanda)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.idSportsman])
        .parameter('taullo', tediousTYPES.Bit, sportsmanDetails[constants.colRegisterSportsmanExcel.isTaullo])
        .parameter('sanda', tediousTYPES.Bit, sportsmanDetails[constants.colRegisterSportsmanExcel.isSanda])
        .execute()
        .then(async function (testResults) {
            if (i + 1 < users.length)
                await insertSportStyleDB(trans, users, users[i + 1], (i + 1));
            return testResults;
        })
}

/**
 * updating the details of coach entity
 * @param coachDetails
 * @return {status, results} - result contains successful message or errors
 */
async function updateCoachProfile(coachDetails) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`UPDATE user_Coach SET id = ISNULL(@idCoach, id),
                                                            firstname = ISNULL(@firstName, firstname),
                                                            lastname  = ISNULL(@lastName, lastname),
                                                            phone     = ISNULL(@phone, phone),
                                                            email     = ISNULL(@email, email),
                                                            birthdate = ISNULL(@birthDate, birthdate),
                                                            address   = ISNULL(@address, address)
                                                                            where id = @oldId;`)
                .parameter('idCoach', tediousTYPES.Int, coachDetails[0])
                .parameter('firstName', tediousTYPES.NVarChar, coachDetails[1])
                .parameter('lastName', tediousTYPES.NVarChar, coachDetails[2])
                .parameter('phone', tediousTYPES.NVarChar, coachDetails[3])
                .parameter('email', tediousTYPES.NVarChar, coachDetails[4])
                .parameter('birthDate', tediousTYPES.Date, coachDetails[5])
                .parameter('address', tediousTYPES.NVarChar, coachDetails[6])
                .parameter('oldId', tediousTYPES.Int, coachDetails[7])
                .execute()
        })
        .then(async function (testResult) {
            let newId = coachDetails[0];
            let oldId = coachDetails[7];
            if (newId != oldId) {
                return await trans.sql(`UPDATE user_Passwords SET id = @id WHERE id = @oldId;`)
                    .parameter('id', tediousTYPES.Int, newId)
                    .parameter('oldId', tediousTYPES.Int, oldId)
                    .returnRowCount()
                    .execute();
            }
        })
        .then(function (results) {
            //sendUpdateEmail(coachDetails)
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.updateUserDetails;
            //trans.commitTransaction();
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
            //trans.rollbackTransaction();
        });
    return [ans,trans];
}

async function sendEmail(users) {
    var subject = 'רישום משתמש חדש wuhsu'
    users.forEach((user) => {
        if (user[constants.colRegisterSportsmanExcel.email]) {
            var textMsg = "שלום " + user[constants.colRegisterSportsmanExcel.firstName] + "\n" +
                "הינך רשום למערכת של התאחדות האו-שו" + "\n" +
                "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
                + "שם פרטי: " + user[constants.colRegisterSportsmanExcel.firstName] + "\n"
                + "שם משפחה: " + user[constants.colRegisterSportsmanExcel.lastName] + "\n"
                + "כתובת מגורים: " + user[constants.colRegisterSportsmanExcel.address] + "\n"
                + "פאלפון: " + user[constants.colRegisterSportsmanExcel.phone] + "\n"
                + "תאריך לידהי: " + user[constants.colRegisterSportsmanExcel.birthDate] + "\n"
                + "תעודת זהות: " + user[constants.colRegisterSportsmanExcel.idSportsman] + "\n"
                + " שם המשתמש והסיסמא הראשונית שלך הינם תעודת הזהות שלך" + "\n\n\n"
                + "בברכה, " + "\n" +
                "מערכת או-שו"
            common_func.sendEmail(user[constants.colRegisterSportsmanExcel.email], textMsg, subject)
        }
    })
}


async function sendUpdateEmail(coachDetails) {
    if (coachDetails[4]) {
        var subject = 'עדכון פרטי משתמש'
        var textMsg = "שלום " + coachDetails[1] + "\n" +
            "לבקשתך עודכנו הפרטים האישים שלך במערכת" + "\n" +
            "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
            + "שם פרטי: " + coachDetails[1] + "\n"
            + "שם משפחה: " + coachDetails[2] + "\n"
            + "כתובת מגורים: " + coachDetails[6] + "\n"
            + "פאלפון: " + coachDetails[3] + "\n"
            + "תאריך לידה: " + coachDetails[5] + "\n"
            + "תעודת זהות: " + coachDetails[0] + "\n"
            + "בברכה, מערכת או-שו"
        await common_func.sendEmail(coachDetails[0], subject, textMsg)
    }
}

async function updateProfile(data, access, id, profile) {
    let ans;
    if (id == data.id || access === constants.userType.MANAGER) {
        let user = combineData(data, profile)
        ans = userValidation.validateUserDetails(user, "coach")
        if (ans.canUpdate) {
            ans = await updateCoachProfile(common_func.getArrayFromJson(ans.data));
            return ans
        }
        ans =[]
        ans[0] = new Object()
        ans[0].status = constants.statusCode.badRequest
        return ans
    }
}

function combineData(data, profile) {
    let user = {
        id: data.id ? data.id : profile.id,
        firstName: data.firstName ? data.firstName : profile.firstname,
        lastName: data.lastName ? data.lastName : profile.lastname,
        phone: data.phone ? data.phone : profile.phone,
        email: data.email ? data.email : profile.email,
        birthDate: data.birthDate ? data.birthDate : (new Date(profile.birthdate)).toLocaleDateString(),
        address: data.address ? data.address : profile.address,
        oldId: data.oldId ? data.oldId : profile.id
    }
    return user
}


module.exports.registerSportsman = registerSportsman;
module.exports.updateCoachProfile = updateCoachProfile;
module.exports.insertPasswordDB = insertPasswordDB;
module.exports.updateProfile = updateProfile;
