const constants = require('../../constants')

async function insertSportStyleDB(trans, users, sportsmanDetails, i) {
    return trans.sql(`INSERT INTO sportsman_sportStyle (id, taullo,sanda)
                    Values (@idSportsman,@taullo ,@sanda)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.idSportsman])
        .parameter('taullo', tediousTYPES.Bit, sportsmanDetails[constants.colRegisterSportsmanExcel.isTaullo])
        .parameter('sanda', tediousTYPES.Bit, sportsmanDetails[constants.colRegisterSportsmanExcel.isSanda])
        .execute()
        .then(async function (testResults) {
            if (i + 1 < users.length)
                await insertSportStyleDB(trans, users, users[i + 1], (i + 1));
            return testResults;
        })
}
module.exports.insertSportStyleDB=insertSportStyleDB