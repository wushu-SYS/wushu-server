const constants = require('../../constants')

async function insertNewJudgeDB(trans, judges, judge, number) {
    return trans.sql(` INSERT INTO user_Judge (id, firstname, lastname, phone, email,photo)
                                    VALUES (@idSportsman, @firstName, @lastName, @phone, @email ,@photo)`)
        .parameter('idSportsman', tediousTYPES.Int, judge[constants.colRegisterJudgeExcel.id])
        .parameter('firstName', tediousTYPES.NVarChar, judge[constants.colRegisterJudgeExcel.firstName])
        .parameter('lastName', tediousTYPES.NVarChar, judge[constants.colRegisterJudgeExcel.lastName])
        .parameter('phone', tediousTYPES.NVarChar, judge[constants.colRegisterJudgeExcel.phone])
        .parameter('email', tediousTYPES.NVarChar, judge[constants.colRegisterJudgeExcel.email])
        .parameter('photo', tediousTYPES.NVarChar, constants.defaultProfilePic)
        .execute()
        .then(async function (testResult) {
            if (number + 1 < judges.length)
                await insertNewJudgeDB(trans, judges, judge[number + 1], number + 1)
            return testResult
        })
}

/**
 * handle registration of coach as a judge in the system
 * @param judges
 * @return {status, results}
 */
async function registerCoachAsJudge(judges) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return trans.sql(`Insert into user_Judge (id,firstname,lastname,phone,photo,email)
                        SELECT id, firstname, lastname, phone,photo,email
                        from user_Coach
                        where id in (${judges})`)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.registerSuccess
            trans.commitTransaction();
        })
        .fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans;
}

async function getJudges() {
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

async function getJudgeProfileById(id) {
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


async function deleteJudge(judgeId) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`DELETE FROM user_UserTypes WHERE id = @judgeId and usertype = @type;`)
                .parameter('judgeId', tediousTYPES.Int, judgeId)
                .parameter('type', tediousTYPES.Int, constants.userType.JUDGE)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM user_Judge WHERE id = @judgeId;`)
                .parameter('judgeId', tediousTYPES.Int, judgeId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            //TODO: delete judge directory on drive - job name deleteSportsmanFilesFromGoogleDrive
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

async function updateJudgeProfile(user) {
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

async function getJudgesForReminder() {
    let ans = new Object();
    await dbUtils.sql(`select user_Judge.id,email from user_Judge where user_Judge.id not in(select id from judge_files )`)
        .execute()
        .then(function (results) {
            ans = results
        }).fail(function (err) {
            console.log(err)
            ans = err;
        });
    return ans;
}

module.exports.insertNewJudgeDB = insertNewJudgeDB
module.exports.registerCoachAsJudge = registerCoachAsJudge
module.exports.getJudges = getJudges
module.exports.getJudgeProfileById = getJudgeProfileById
module.exports.deleteJudge = deleteJudge
module.exports.updateJudgeProfile = updateJudgeProfile
module.exports.getJudgesForReminder = getJudgesForReminder