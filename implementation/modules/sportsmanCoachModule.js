const constants = require('../../constants')

async function insertCoachDB(trans, users, sportsmanDetails, i) {
    return trans.sql(`INSERT INTO sportsman_coach (idSportman,idCoach)
                    Values (@idSportsman,@idCoach)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.idSportsman])
        .parameter('idCoach', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.idCoach])
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertCoachDB(trans, users, users[i + 1], (i + 1))
            return testResult
        })
}


async function getCoachSportsmen(coachId) {
    let ans = new Object();
    await dbUtils.sql(`select * from user_Sportsman join sportsman_coach sc on user_Sportsman.id = sc.idSportman where idCoach = @coachId`)
        .parameter('coachId', tediousTYPES.Int, coachId)
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

async function updateSportsmanCoach(idCoach, idSportsman) {
    console.log(idCoach)
    console.log(idSportsman)
    let ans = new Object()
    await dbUtils.sql(`update sportsman_coach set idCoach = @idCoach where idSportman = @idSportsman `)
        .parameter('idSportsman', tediousTYPES.Int, idSportsman)
        .parameter('idCoach', tediousTYPES.Int, idCoach)
        .execute()
        .then(result => {
            ans.results = constants.msg.updateUserDetails;
            ans.status = constants.statusCode.ok;
        })
        .fail((err) => {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans
}

async function checkIdCoachRelatedSportsman(idCoach, idSportsman) {
    await dbUtils.sql('select idCoach from sportsman_coach where idSportsman = @idSportsman ')
        .parameter('idSportsman', tediousTYPES.Int, idSportsman)
        .execute()
        .then(result => {
            return idCoach == result[0]
        })
        .fail((error) => {
            return false;
        });

}

module.exports.insertCoachDB = insertCoachDB
module.exports.getCoachSportsmen = getCoachSportsmen
module.exports.updateSportsmanCoach = updateSportsmanCoach
module.exports.checkIdCoachRelatedSportsman = checkIdCoachRelatedSportsman