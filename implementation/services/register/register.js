const constants = require('../../../constants')
const userSportsmanModule = require('../../modules/userSportsmanModule')
const userPasswordModule = require('../../modules/userPasswordModule')
const sportsmanSportStyleModule = require('../../modules/sportsmanSportStyleModule')
const sportsmanCoachModule = require('../../modules/sportsmanCoachModule')
const userCoachModule = require('../../modules/userCoachModule')
const userJudgeModule = require('../../modules/userJudgeModule')
const common_func = require('../../commonFunc')
const dbConnection = require('../../../dbUtils').dbConnection


/**
 * register new sportsmen to the system, supports manual registration of one sportsman and also excel registration
 * @param users - list of users to register
 * @return {status, results} - result contains successful message or errors
 */
async function registerSportsman(users) {
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    await userSportsmanModule.insertSportsmanDB(trans, users, users[0], 0)
        .then((async () => {
            await userPasswordModule.insertPasswordDB(trans, users, users[0], 0, constants.userType.SPORTSMAN)
                .then(async () => {
                    await sportsmanCoachModule.insertCoachDB(trans, users, users[0], 0)
                        .then(async () => {
                            await sportsmanSportStyleModule.insertSportStyleDB(trans, users, users[0], 0)
                                .then((result) => {
                                    //sendEmail(users);
                                    ans.status = constants.statusCode.ok;
                                    ans.results = constants.msg.registerSuccess;
                                    trans.commit();
                                })
                        })
                })
        })).catch((err) => {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            console.log(err)
            trans.rollback();

        })
    return ans
}

async function registerCoaches(users) {
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    await userCoachModule.insertNewCoachDB(trans, users, users[0], 0)
        .then(async () => {
            await userPasswordModule.insertPasswordDB(trans, users, users[0], 0, constants.userType.COACH)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.registerSuccess;
                    trans.commit();
                })
        }).catch((err) => {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollback();
        })
    return ans
}


/**
 * handle inserting new judge to the db
 * @param judges
 * @return {status, results}
 */
async function registerNewJudge(judges) {
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    await userJudgeModule.insertNewJudgeDB(trans, judges, judges[0], 0)
        .then(async () => {
            await userPasswordModule.insertPasswordDB(trans, judges, judges[0], 0, constants.userType.JUDGE)
                .then(() => {
                    //sendEmail(users);
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.registerSuccess;
                    trans.commit();
                })
        }).catch((err) => {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            console.log(err)
            trans.rollback();
        })
    return ans
}

async function registerAdmin(user) {
    let ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    await trans.query({
        sql: `insert into user_Manger (id, firstname, lastname, email)
                        values  (:id,:firstName,:lastName,:email);`,
        params: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        }
    }).then(async () => {
        await userPasswordModule.insertPasswordDB(trans, [user], common_func.getArrayFromJson(user), 0, constants.userType.MANAGER)
            .then(() => {
                //sendEmail(users);
                ans.status = constants.statusCode.ok;
                ans.results = constants.msg.registerSuccess;
                trans.commit();
            })
    }).catch((err) => {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
        trans.rollback();
    })
    return ans
}

module.exports.registerSportsman = registerSportsman;
module.exports.registerCoaches = registerCoaches;
module.exports.registerNewJudge = registerNewJudge;
module.exports.registerAdmin = registerAdmin;
