const common_func = require("../commonFunc");
const constants = require("../../constants")



async function insertSportsmanDB(trans, users, sportsmanDetails, i) {
    return trans.sql(` INSERT INTO user_Sportsman (id, firstname, lastname, phone, email, birthdate, address, sportclub, sex,photo)
                                    VALUES (@idSportsman, @firstName, @lastName, @phone, @email, @birthDate, @address, @sportClub, @sex ,@photo)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.idSportsman])
        .parameter('firstName', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.firstName])
        .parameter('lastName', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.lastName])
        .parameter('phone', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.phone])
        .parameter('address', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.address])
        .parameter('birthDate', tediousTYPES.NVarChar	, sportsmanDetails[constants.colRegisterSportsmanExcel.birthDate])
        .parameter('email', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.email])
        .parameter('sportClub', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.sportClub])
        .parameter('sex', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.sex])
        .parameter('sportType', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.sportStyle])
        .parameter('photo', tediousTYPES.NVarChar, constants.defaultProfilePic)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertSportsmanDB(trans, users, users[i + 1], i + 1);
            return testResult
        })

}

async function insertPasswordDB(trans, users, userDetails, i, userType) {
    return trans.sql(`INSERT INTO user_Passwords (id,password,usertype,isfirstlogin)
                    Values (@idSportsman ,@password,@userType,@isFirstLogin)`)
        .parameter('idSportsman', tediousTYPES.Int, userDetails[constants.colRegisterSportsmanExcel.idSportsman])
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
    return trans.sql(`INSERT INTO sportsman_sportStyle (id, sportStyle)
                    Values (@idSportsman,@sportStyle)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.idSportsman])
        .parameter('sportStyle', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.sportStyle])
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
    await dbUtils.sql(`UPDATE user_Coach SET  firstname = @firstName, lastname = @lastName, phone = @phone, email = @email, birthdate = @birthDate,
                      address = @address where id =@idCoach;`)
        .parameter('idCoach', tediousTYPES.Int, coachDetails[0])
        .parameter('firstName', tediousTYPES.NVarChar, coachDetails[1])
        .parameter('lastName', tediousTYPES.NVarChar, coachDetails[2])
        .parameter('phone', tediousTYPES.NVarChar, coachDetails[3])
        .parameter('email', tediousTYPES.NVarChar, coachDetails[4])
        .parameter('birthDate', tediousTYPES.Date, coachDetails[5])
        .parameter('address', tediousTYPES.NVarChar, coachDetails[6])
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.updateUserDetails;
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

async function sendEmail(users) {
    var subject = 'רישום משתמש חדש wuhsu'
    users.forEach((user) => {
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
    })


}

module.exports.registerSportsman = registerSportsman;
module.exports.updateCoachProfile = updateCoachProfile;
module.exports.insertPasswordDB = insertPasswordDB;
