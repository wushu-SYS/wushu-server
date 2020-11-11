const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

async function insertCoachDB(trans, users, sportsmanDetails, i) {
    return trans.query({
        sql: `INSERT INTO sportsman_coach (idSportman,idCoach)
                    Values (:idSportsman,:idCoach)`,
        params: {
            idSportsman: sportsmanDetails[constants.colRegisterSportsmanExcel.idSportsman],
            idCoach: sportsmanDetails[constants.colRegisterSportsmanExcel.idCoach]
        }
    }).then(async function () {
        if (i + 1 < users.length)
            await insertCoachDB(trans, users, users[i + 1], (i + 1))
    })
}

async function getCoachSportsmen(coachId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `select * from user_Sportsman join sportsman_coach sc on user_Sportsman.id = sc.idSportman where idCoach = :coachId`,
        params: {coachId: coachId}
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

async function updateSportsmanCoach(idCoach, idSportsman) {
    let ans = new Object()
    await dbConnection.query({
        sql: `update sportsman_coach set idCoach = :idCoach where idSportman = :idSportsman `,
        params: {
            idSportsman: idSportsman,
            idCoach: idCoach
        }
    }).then(result => {
        ans.results = constants.msg.updateUserDetails;
        ans.status = constants.statusCode.ok;
    })
        .catch((err) => {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans
}

async function checkIdCoachRelatedSportsman(idCoach, idSportsman) {
    let res
    await dbConnection.query({
        sql: 'select idCoach from sportsman_coach where idSportman = :idSportsman ',
        params: {idSportsman: idSportsman}
    }).then(result => {
        result = result.results
        res = (idCoach == result[0].idCoach)
    }).catch((error) => {
        console.log(error)
        res = false;
    });
    return res
}

module.exports.insertCoachDB = insertCoachDB
module.exports.getCoachSportsmen = getCoachSportsmen
module.exports.updateSportsmanCoach = updateSportsmanCoach
module.exports.checkIdCoachRelatedSportsman = checkIdCoachRelatedSportsman
