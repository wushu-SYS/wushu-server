const constants = require('../../../constants')
const userSportsmanModule = require('../../modules/userSportsmanModule')
const userPasswordModule = require('../../modules/userPasswordModule')
const sportsmanSportStyleModule = require('../../modules/sportsmanSportStyleModule')
const sportsmanCoachModule = require('../../modules/sportsmanCoachModule')
const userCoachModule = require('../../modules/userCoachModule')
const userJudgeModule = require('../../modules/userJudgeModule')
const common_func = require('../../commonFunc')

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
            await Promise.all(await userSportsmanModule.insertSportsmanDB(trans, users, users[0], 0), await userPasswordModule.insertPasswordDB(trans, users, users[0], 0, constants.userType.SPORTSMAN), await sportsmanCoachModule.insertCoachDB(trans, users, users[0], 0), await sportsmanSportStyleModule.insertSportStyleDB(trans, users, users[0], 0)
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

async function registerCoaches(users) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await userCoachModule.insertNewCoachDB(trans, users, users[0], 0), await userPasswordModule.insertPasswordDB(trans, users, users[0], 0, constants.userType.COACH)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.registerSuccess;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                }))
        })
        .fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        });

    return ans
}


/**
 * handle inserting new judge to the db
 * @param judges
 * @return {status, results}
 */
async function registerNewJudge(judges) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await userJudgeModule.insertNewJudgeDB(trans, judges, judges[0], 0), await userPasswordModule.insertPasswordDB(trans, judges, judges[0], 0, constants.userType.JUDGE)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.registerSuccess;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                }))
        })
        .fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        });

    return ans
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
                .execute(), await userPasswordModule.insertPasswordDB(trans, [user], common_func.getArrayFromJson(user), 0, constants.userType.MANAGER)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.registerSuccess;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                }))
        })
        .fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        });

    return ans
}

module.exports.registerSportsman = registerSportsman;
module.exports.registerCoaches = registerCoaches;
module.exports.registerNewJudge = registerNewJudge;
module.exports.registerAdmin = registerAdmin;
