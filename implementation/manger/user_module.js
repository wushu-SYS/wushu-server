const mutual = require("../common/user_module");
const sysfunc = require("../commonFunc")
let checkUserData = require("../services/commonExcelDataCheck");
const coach_user_module = require("../coach/user_module");

function checkDataBeforeRegister(coaches) {
    let errorUsers = []
    let res = new Object();
    res.isPassed = true;
    let line = 1;
    let tmpErr = new Object();
    coaches.forEach(function (coach) {
        line++
        if (coach.length != Constants.colRegisterCoachExcel.numCell) {
            tmpErr = new Object();
            res.isPassed = false;
            tmpErr.errors = [Constants.errorMsg.cellEmpty]
        } else {
            if (coach[Constants.colRegisterCoachExcel.sportClub].length > 5)
                coach[Constants.colRegisterCoachExcel.sportClub] = checkUserData.getClubId(coach[Constants.colRegisterCoachExcel.sportClub]);

            tmpErr = checkCoach(coach)
            coach[Constants.colRegisterCoachExcel.birthDate] = sysfunc.setBirtdateFormat(coach[Constants.colRegisterCoachExcel.birthDate])
        }
        if (tmpErr.errors.length > 0) {
            tmpErr.line = line;
            errorUsers.push(tmpErr)
            res.isPassed = false;

        }
    })
    res.results = errorUsers;
    res.users = coaches;

    return res;
}

function checkCoach(user) {
    let err = new Object()
    let collectErr = [];

    //id user
    if (!checkUserData.checkIdUser(user[Constants.colRegisterCoachExcel.idCoach]))
        collectErr.push(Constants.errorMsg.idSportmanErr)


    //firstname
    if (!checkUserData.checkFirstNameLastName(user[Constants.colRegisterCoachExcel.firstName]))
        collectErr.push(Constants.errorMsg.firstNameHeb)


    //lastname
    if (!checkUserData.checkFirstNameLastName(user[Constants.colRegisterCoachExcel.lastName]))
        collectErr.push(Constants.errorMsg.lastNameHeb)

    //address
    if (!checkUserData.checkAddress(user[Constants.colRegisterCoachExcel.address]))
        collectErr.push(Constants.errorMsg.addressErr)

    //birthDate
    /*
    if (!checkUserData.checkBirthDate(user[Constants.colRegisterCoachExcel.birthDate]))
        collectErr.push(Constants.errorMsg.birthDateErr)

     */
    //phone
    if (!checkUserData.checkPhone(user[Constants.colRegisterCoachExcel.phone]))
        collectErr.push(Constants.errorMsg.phoneErr)
    //email
    if (!checkUserData.checkEmail(user[Constants.colRegisterCoachExcel.email]))
        collectErr.push(Constants.errorMsg.emailErr)
    //sportClub
    if (!checkUserData.checkSportClub(user[Constants.colRegisterCoachExcel.sportClub]))
        collectErr.push(Constants.errorMsg.sportClubErr)

    err.errors = collectErr;
    return err;


}

async function insertNewCoachDB (trans, users, coachDetails, i){
    return trans.sql(` INSERT INTO user_Coach (id, firstname, lastname, phone, email, birthdate, address, sportclub,photo)
                                    VALUES (@idCoach, @firstName, @lastName, @phone, @email, @birthDate, @address, @sportClub ,@photo)`)
        .parameter('idCoach', tediousTYPES.Int, coachDetails[Constants.colRegisterCoachExcel.idCoach])
        .parameter('firstName', tediousTYPES.NVarChar, coachDetails[Constants.colRegisterCoachExcel.firstName])
        .parameter('lastName', tediousTYPES.NVarChar, coachDetails[Constants.colRegisterCoachExcel.lastName])
        .parameter('phone', tediousTYPES.NVarChar, coachDetails[Constants.colRegisterCoachExcel.phone])
        .parameter('address', tediousTYPES.NVarChar, coachDetails[Constants.colRegisterCoachExcel.address])
        .parameter('birthDate', tediousTYPES.Date, coachDetails[Constants.colRegisterCoachExcel.birthDate])
        .parameter('email', tediousTYPES.NVarChar, coachDetails[Constants.colRegisterCoachExcel.email])
        .parameter('sportClub', tediousTYPES.Int, coachDetails[Constants.colRegisterCoachExcel.sportClub])
        .parameter('photo', tediousTYPES.NVarChar, Constants.defaultProfilePic)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertNewCoachDB(trans, users, users[i + 1], i + 1)
            return testResult
        })

}

async function registerCoaches(users) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await insertNewCoachDB(trans, users, users[0], 0), await coach_user_module.insertPasswordDB(trans, users, users[0], 0, Constants.userType.COACH)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = Constants.statusCode.ok;
                    ans.results = Constants.msg.registerSuccess;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = Constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                }))
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        });

    return ans
}

async function deleteCoach(coach){
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM user_Passwords WHERE id = @coachId;`)
                .parameter('coachId', tediousTYPES.Int, coach)
                .returnRowCount()
                .execute();
        })

        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM user_Coach WHERE id = @coachId;`)
                .parameter('coachId', tediousTYPES.Int, coach)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.userDeleted;
            trans.commitTransaction();
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans;
}



async function sendMail(req) {
    var subject = 'רישום משתמש חדש wuhsu'
    var textMsg = "שלום" + req.body.firstname + "\n" +
        "הינך רשום למערכת של התאחדות האו-שו" + "\n"
    "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
    + "שם פרטי: " + req.body.firstname + "\n"
    + "שם משפחה: " + req.body.lastname + "\n"
    + "כתובת מגורים: " + req.body.address + "\n"
    + "פאלפון: " + req.body.phone + "\n"
    + "תאריך לידהי: " + req.body.birthdate + "\n"
    + "תעודת זהות: " + req.body.id + "\n"
    + " שם המשתמש והסיסמא הראשונית שלך הינם תעודת הזהות"
    + "בברכה, מערכת או-שו"
    sysfunc.sendEmail(req.body.email, subject, textMsg)
}

module.exports.registerCoaches = registerCoaches;
module.exports.checkDataBeforeRegister = checkDataBeforeRegister;
module.exports.deleteCoach = deleteCoach;

