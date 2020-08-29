const common_func = require("../commonFunc")
const coach_user_module = require("../coach/user_module");
const pass = require("../coach/user_module")
let constants = require("../../constants");

async function insertNewCoachDB(trans, users, coachDetails, i) {
    return trans.sql(` INSERT INTO user_Coach (id, firstname, lastname, phone, email, birthdate, address, sportclub,photo)
                                    VALUES (@idCoach, @firstName, @lastName, @phone, @email, @birthDate, @address, @sportClub ,@photo)`)
        .parameter('idCoach', tediousTYPES.Int, coachDetails[Constants.colRegisterCoachExcel.idCoach])
        .parameter('firstName', tediousTYPES.NVarChar, coachDetails[Constants.colRegisterCoachExcel.firstName])
        .parameter('lastName', tediousTYPES.NVarChar, coachDetails[Constants.colRegisterCoachExcel.lastName])
        .parameter('phone', tediousTYPES.NVarChar, coachDetails[Constants.colRegisterCoachExcel.phone])
        .parameter('address', tediousTYPES.NVarChar, coachDetails[Constants.colRegisterCoachExcel.address])
        .parameter('birthDate', tediousTYPES.NVarChar, coachDetails[Constants.colRegisterCoachExcel.birthDate])
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

/**
 * handle deleting coach from the system
 * @param coach - to delete
 * @return {status, results}
 */
async function deleteCoach(coach) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`DELETE FROM user_UserTypes WHERE id = @id and usertype = @type;`)
                .parameter('id', tediousTYPES.Int, coach)
                .parameter('type', tediousTYPES.Int, constants.userType.COACH)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM user_Coach WHERE id = @id;`)
                .parameter('id', tediousTYPES.Int, coach)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.userDeleted;
           await trans.commitTransaction();
        })
        .fail(async function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            await trans.rollbackTransaction();
        })
    return ans;
}

async function registerAdmin(user) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await dbUtils.sql(`insert into user_Manger (id, firstname, lastname, email)
                        values  (@id,@firstName,@lastName,@email);`)
                .parameter('id', tediousTYPES.Int, user.id)
                .parameter('firstName', tediousTYPES.NVarChar, user.firstName)
                .parameter('lastName', tediousTYPES.NVarChar, user.lastName)
                .parameter('email', tediousTYPES.NVarChar, user.email)
                .execute(), await pass.insertPasswordDB(trans, [user], common_func.getArrayFromJson(user), 0, Constants.userType.MANAGER)
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
async function getAdmins(){
    let ans = new Object();
    await dbUtils.sql('Select * from user_Manger order by firstname')
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}
async function deleteAdmin(id){
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`DELETE FROM user_UserTypes WHERE id = @id and usertype =@type;`)
                .parameter('id', tediousTYPES.Int, id)
                .parameter('type', tediousTYPES.Int, constants.userType.MANAGER)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM user_Manger WHERE id = @id;`)
                .parameter('id', tediousTYPES.Int, id)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.userDeleted;
            await trans.commitTransaction();
        })
        .fail(async function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            await trans.rollbackTransaction();
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
    common_func.sendEmail(req.body.email, subject, textMsg)
}

module.exports.registerCoaches = registerCoaches;
module.exports.deleteCoach = deleteCoach;
module.exports.registerAdmin = registerAdmin;
module.exports.getAdmins = getAdmins;
module.exports.deleteAdmin = deleteAdmin;

