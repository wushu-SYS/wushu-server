const constants = require('../../constants')

async function insertSportStyleDB(trans, users, sportsmanDetails, i) {
    return trans.query({
        sql: `INSERT INTO sportsman_sportStyle (id, taullo,sanda)
                    Values (:idSportsman,:taullo ,:sanda)`,
        params: {
            idSportsman: sportsmanDetails[constants.colRegisterSportsmanExcel.idSportsman],
            taullo: sportsmanDetails[constants.colRegisterSportsmanExcel.isTaullo],
            sanda: sportsmanDetails[constants.colRegisterSportsmanExcel.isSanda]
        }
    }).then(async function () {
        if (i + 1 < users.length)
            await insertSportStyleDB(trans, users, users[i + 1], (i + 1));
    })
}

module.exports.insertSportStyleDB = insertSportStyleDB