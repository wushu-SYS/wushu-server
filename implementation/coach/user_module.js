const common = require("../common/user_module");
const sysfunc = require("../commonFunc");
const userValidation = require("../services/userValidations/userValidationService");
const constants = require("../../constants")


function checkExcelDataBeforeRegister(users) {
    let errorUsers = [];
    let res = {};
    res.isPassed = true;
    let line = 1;
    users.forEach(function (user) {
        let userError = new Object();
        line++;
        user[constants.colRegisterSportsmanExcel.sportClub] = getClubId(user[constants.colRegisterSportsmanExcel.sportClub]);
        user[constants.colRegisterSportsmanExcel.idCoach] = getCoachId(user[constants.colRegisterSportsmanExcel.idCoach]);
        userError.errors = userValidation.sportsManExcelValidations(user);

        if (userError.errors.length !== 0) {
            userError.line = line;
            errorUsers.push(userError)
            res.isPassed = false;
        }
    });
    res.results = errorUsers;
    res.users = users;
    return res;

}

function checkDataBeforeRegister(user) {
    let errorUsers = [];
    let res = new Object();
    res.isPassed = true;
    user.birthDate = setDateFormat(user.birthDate);
    let userError = new Object();
    userError.errors = userValidation.sportsmanManualValidations(user);

    if (userError.errors.length !== 0) {
        userError.line = 1;
        errorUsers.push(userError);
        res.isPassed = false;
    }
    res.results = errorUsers;
    res.users = user;

    return res;
}

function setDateFormat(birthDate) {
    if (birthDate != undefined) {
        let initial = birthDate.split("/");
        return ([initial[2], initial[0], initial[1]].join('-'));
    }
}

function getClubId(line) {
    line = line.split(" ")[line.split(" ").length - 1];
    line = line.substring(0, line.length - 1);
    return parseInt(line)

}

function getCoachId(line) {
    line = line.split(" ")[line.split(" ").length - 1];
    line = line.substring(0, line.length - 1);
    return parseInt(line)

}


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
        sysfunc.sendEmail(user[constants.colRegisterSportsmanExcel.email], textMsg, subject)
    })


}

module.exports.registerSportsman = registerSportsman;
module.exports.checkDataBeforeRegister = checkDataBeforeRegister;
module.exports.checkExcelDataBeforeRegister = checkExcelDataBeforeRegister;