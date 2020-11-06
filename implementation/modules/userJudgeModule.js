const constants = require('../../constants')
const {dbConnection} = require("../../dbUtils");

async function insertNewJudgeDB(trans, judges, judge, number) {
    return trans.query({
        sql: ` INSERT INTO user_Judge (id, firstname, lastname, phone, email,photo)
                                    VALUES (:idSportsman, :firstName, :lastName, :phone, :email ,:photo)`,
        params: {
            idSportsman: judge[constants.colRegisterJudgeExcel.id],
            firstName: judge[constants.colRegisterJudgeExcel.firstName],
            lastName: judge[constants.colRegisterJudgeExcel.lastName],
            phone: judge[constants.colRegisterJudgeExcel.phone],
            email: judge[constants.colRegisterJudgeExcel.email],
            photo: constants.defaultProfilePic

        }
    }).then(async function () {
        if (number + 1 < judges.length)
            await insertNewJudgeDB(trans, judges, judge[number + 1], number + 1)
    })
}

/**
 * handle registration of coach as a judge in the system
 * :param judges
 * :return {status, results}
 */
async function registerCoachAsJudge(judges) {
    let ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    trans.query({
        sql: `Insert into user_Judge (id,firstname,lastname,phone,photo,email)
                        SELECT id, firstname, lastname, phone,photo,email
                        from user_Coach
                        where id in (${judges})`
    }).then(async function () {
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.registerSuccess
        trans.commit();
    }).catch(function (err) {
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
        console.log(err)
        trans.rollback();
    })
    return ans;
}

async function getJudges() {
    let ans = new Object();
    await dbConnection.query({
        sql: `Select * from user_Judge`
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
    });
    return ans;

}

async function getJudgeProfileById(id) {
    let ans = new Object();
    await dbConnection.query({
        sql: `Select user_Judge.*, criminalRecord from user_Judge left join judge_files on user_Judge.id = judge_files.id where user_Judge.id = :idJudge`,
        params: {
            idJudge: id
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results[0]
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
    });
    return ans;
}


async function deleteJudge(judgeId) {
    let ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    await trans.query({
        sql: `DELETE FROM user_UserTypes WHERE id = :judgeId and usertype = :type;`,
        params: {
            judgeId: judgeId,
            type: constants.userType.JUDGE
        }
    }).then(async function () {
        await trans.query({
            sql: `DELETE FROM user_Judge WHERE id = :judgeId;`,
            params: {judgeId: judgeId}
        })
    }).then(async function () {
        //TODO: delete judge directory on drive - job name deleteSportsmanFilesFromGoogleDrive
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.userDeleted;
        await trans.commit();
    })
        .catch(async function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            await trans.rollback();
        })
    return ans;
}

async function updateJudgeProfile(user) {
    let ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    await trans.query({
        sql: `UPDATE user_Judge SET id = ifnull(:id, id),
                                                            firstname = ifnull(:firstName, firstname),
                                                            lastname  = ifnull(:lastName, lastname),
                                                            phone     = ifnull(:phone, phone),
                                                            email     = ifnull(:email, email)
                                                               where id = :oldId;`,
        params: {
            id: user[0],
            firstName: user[1],
            lastName: user[2],
            phone: user[3],
            email: user[4],
            oldId: user[5],
        }
    }).then(async function () {
        let newId = user[0];
        let oldId = user[5];
        if (newId != oldId) {
            await trans.query({
                sql: `UPDATE user_Passwords SET id = :id WHERE id = :oldId;`,
                params: {
                    id: newId,
                    oldId: oldId
                }
            })
        }
    }).then(function () {
        //sendJudgeUpdateEmail(user)
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.updateUserDetails;
        //trans.commitTransaction();
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
        //trans.rollbackTransaction();
    });
    return [ans, trans];
}

async function getJudgesForReminder() {
    let ans = new Object();
    await dbConnection.query({
        sql: `select user_Judge.id,email from user_Judge where user_Judge.id not in(select id from judge_files )`
    }).then(function (results) {
        ans = results.results
    }).catch(function (err) {
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