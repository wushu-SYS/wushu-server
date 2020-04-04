const constants = require("../../constants");

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
            return await trans.sql(`UPDATE user_Judge SET id = @id, firstname = @firstName, lastname = @lastName, phone = @phone, email = @email where id =@oldId;`).parameter('id', tediousTYPES.Int, user[0])
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
                return await trans.sql(`UPDATE user_Passwords SET id = @sportsmanId WHERE id = @oldId;`)
                    .parameter('sportsmanId', tediousTYPES.Int, newId)
                    .parameter('oldId', tediousTYPES.Int, oldId)
                    .returnRowCount()
                    .execute();
            }
        })
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.updateUserDetails;
            trans.commitTransaction();
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        });
    return ans;
}


module.exports.getReferees = getReferees;
module.exports.getJudgesToRegister = getJudgesToRegister;
module.exports.getRefereeProfileById = getRefereeProfileById;
module.exports.updateRefereeProfile = updateRefereeProfile;
