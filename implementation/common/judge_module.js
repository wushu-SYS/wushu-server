const constants = require("../../constants");
const userValidation = require("../services/userValidations/userValidationService")
const common_func = require("../commonFunc");


async function getJudgesToRegister() {
    let ans = new Object();
    await dbUtils.sql(`Select * from user_Coach where user_Coach.id not in (select user_Coach.id from user_Coach inner join user_Judge on user_Coach.id =user_Judge.id )`)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

async function getReferees() {
    let ans = new Object();
    await dbUtils.sql(`Select * from user_Judge`)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;

}

async function getRefereeProfileById(id) {
    let ans = new Object();
    await dbUtils.sql(`Select user_Judge.*, criminalRecord from user_Judge left join judge_files on user_Judge.id = judge_files.id where user_Judge.id = @idJudge`)
        .parameter('idJudge', tediousTYPES.Int, id)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results[0]
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

async function updateRefereeProfile(user) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`UPDATE user_Judge SET id = ISNULL(@id, id),
                                                            firstname = ISNULL(@firstName, firstname),
                                                            lastname  = ISNULL(@lastName, lastname),
                                                            phone     = ISNULL(@phone, phone),
                                                            email     = ISNULL(@email, email)
                                                               where id = @oldId;`)
                .parameter('id', tediousTYPES.Int, user[0])
                .parameter('firstName', tediousTYPES.NVarChar, user[1])
                .parameter('lastName', tediousTYPES.NVarChar, user[2])
                .parameter('phone', tediousTYPES.NVarChar, user[3])
                .parameter('email', tediousTYPES.NVarChar, user[4])
                .parameter('oldId', tediousTYPES.Int, user[5])
                .execute()
        })
        .then(async function (testResult) {
            let newId = user[0];
            let oldId = user[5];
            if (newId != oldId) {
                return await trans.sql(`UPDATE user_Passwords SET id = @id WHERE id = @oldId;`)
                    .parameter('id', tediousTYPES.Int, newId)
                    .parameter('oldId', tediousTYPES.Int, oldId)
                    .returnRowCount()
                    .execute();
            }
        })
        .then(function (results) {
            //sendJudgeUpdateEmail(user)
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.updateUserDetails;
            //trans.commitTransaction();
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            //trans.rollbackTransaction();
        });
    return [ans, trans];
}

async function sendJudgeUpdateEmail(user) {
    if (user[4]) {
        var subject = 'עדכון פרטי משתמש'
        var textMsg = "שלום " + user[1] + "\n" +
            "לבקשתך עודכנו הפרטים האישים שלך במערכת" + "\n" +
            "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
            + "שם פרטי: " + user[1] + "\n"
            + "שם משפחה: " + user[2] + "\n"
            + "פאלפון: " + user[3] + "\n"
            + "תעודת זהות: " + user[0] + "\n"
            + "בברכה, מערכת או-שו"
        await common_func.sendEmail(coachDetails[0], subject, textMsg)
    }
}

async function updateProfile(data, access, id, profile) {
    let ans;
    if (id == data.id || access === constants.userType.MANAGER) {
        let user = combineData(data, profile)
        ans = userValidation.validateUserDetails(user, "judge");
        if (ans.canUpdate) {
            ans = await updateRefereeProfile(common_func.getArrayFromJson(ans.data));
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
        oldId: data.oldId ? data.oldId : profile.id
    }
    return user
}


module.exports.getReferees = getReferees;
module.exports.getJudgesToRegister = getJudgesToRegister;
module.exports.getRefereeProfileById = getRefereeProfileById;
module.exports.updateRefereeProfile = updateRefereeProfile;
module.exports.updateProfile = updateProfile;
