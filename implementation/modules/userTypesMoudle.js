const dbConnection = require("../../dbUtils").dbConnection
const constants = require('../../constants')
const userSportsmanModule = require('../modules/userSportsmanModule')
const userCoachModule = require('../modules/userCoachModule')
const userJudgeModule = require('../modules/userJudgeModule')

async function checkUserTypes(userId) {
    let ans = new Object()
    await dbConnection.query({
        sql: `select usertype from user_UserTypes where id = :id`,
        params: {
            id: userId
        }
    }).then(async function (results) {
        if (results.results.length === 0) {
            ans.results = 0
        } else {
            results = results.results
            if (checkUserTypeSportsman(results)) {
                ans = await userSportsmanModule.sportsmanProfile(userId)
            } else if (checkUserTypeCoach(results)) {
                ans = await userCoachModule.getCoachProfileById(userId)
            } else if (checkUserTypeJudge(results)) {
                ans = await userJudgeModule.getJudgeProfileById(userId);
            }
        }
    }).catch(function (err) {
        console.log(err)
        ans.results = err;
    });
    return ans;
}

function checkUserTypeSportsman(results) {
    for (let i = 0; i < results.length; i++) {
        if (results[i].usertype == constants.userType.SPORTSMAN)
            return true
    }
    return false
}

function checkUserTypeCoach(results) {
    for (let i = 0; i < results.length; i++) {
        if (results[i].usertype == constants.userType.COACH)
            return true
    }
    return false
}

function checkUserTypeJudge(results) {
    for (let i = 0; i < results.length; i++) {
        if (results[i].usertype == constants.userType.JUDGE)
            return true
    }
    return false
}

async function getUserTypes(userId) {
    let ans = new Object()
    await dbConnection.query({
        sql: `select usertype from user_UserTypes where id = :id`,
        params: {
            id: userId
        }
    }).then(async function (results) {
        ans.results = results.results
        ans.status = constants.statusCode.ok
    }).catch(function (err) {
        ans.results = err;
        ans.status = constants.statusCode.badRequest
    });
    return ans;
}


module.exports.checkUserTypes = checkUserTypes
module.exports.getUserTypes = getUserTypes
