const constants = require('../../constants')
const userSportsmanModule = require('../modules/userSportsmanModule')
const userCoachModule = require('../modules/userCoachModule')
const userJudgeModule = require('../modules/userJudgeModule')

async function checkUserTypes(userId) {
    let ans = new Object()
    await dbUtils.sql(`select usertype from user_UserTypes where id = @id`)
        .parameter('id', tediousTYPES.Int, userId)
        .execute()
        .then(async function (results) {
            if (results.length === 0) {
                ans.results = 0
            } else {
                if (checkUserTypeSportsman(results)) {
                    ans = await userSportsmanModule.sportsmanProfile(userId)
                } else if (checkUserTypeCoach(results)) {
                    ans = await userCoachModule.getCoachProfileById(userId)
                } else if (checkUserTypeJudge(results)) {
                    ans = await userJudgeModule.getJudgeProfileById(userId);
                }
            }
        })
        .fail(function (err) {
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
    await dbUtils.sql(`select usertype from user_UserTypes where id = @id`)
        .parameter('id', tediousTYPES.Int, userId)
        .execute()
        .then(async function (results) {
            ans.results = results
            ans.status = constants.statusCode.ok
        })
        .fail(function (err) {
            ans.results = err;
            ans.status = constants.statusCode.badRequest
        });
    return ans;
}



module.exports.checkUserTypes = checkUserTypes
module.exports.getUserTypes = getUserTypes