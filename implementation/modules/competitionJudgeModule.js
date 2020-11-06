const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

async function insertJudgeToCompetitionDB(trans, insertJudge, judgeDetails, i, compId) {
    if (judgeDetails != undefined)
        return trans.query({
            sql: `INSERT INTO competition_judge (idCompetition, idJudge)
                     SELECT * FROM (select :compId as idCompetition, :id as idJudge) AS tmp
                     WHERE NOT EXISTS (
                     SELECT idCompetition, idJudge FROM competition_judge WHERE idCompetition = :compId and idJudge = :id)`,
            params: {
                compId: compId,
                id: judgeDetails.id
            }
        }).then(async function () {
            if (i + 1 < insertJudge.length) {
                await insertJudgeToCompetitionDB(trans, insertJudge, insertJudge[i + 1], i + 1, compId)
            }
        });
}

async function deleteJudgeFromCompetitionDB(trans, deleteJudge, judgeDetails, i, compId) {
    if (judgeDetails != undefined)
        return trans.query({
            sql: `DELETE FROM competition_judge WHERE idCompetition=:compId and idJudge = :id;`,
            params: {
                compId: compId,
                id: judgeDetails.id
            }
        }).then(async function () {
            if (i + 1 < deleteJudge.length)
                await deleteJudgeFromCompetitionDB(trans, deleteJudge, deleteJudge[i + 1], i + 1, compId)
        })
}

async function updateMasterToCompetition(trans, compId, idJudge) {
    if (idJudge) {
        return trans.query({
            sql: `update competition_judge set isMaster = 0 where idCompetition = :idComp and idJudge != :idJudge ;
                          update competition_judge set isMaster = 1 where idCompetition =:idComp and idJudge = :idJudge`,
            params: {
                idComp: compId,
                idJudge: idJudge
            }
        })
    }
}

async function getJudges(queryData) {
    let query = initQueryGetJudges(queryData);
    let ans = new Object();
    let compId = queryData ? queryData.competitionId : undefined;
    await dbConnection.query({
        sql: query,
        params: {
            compId: compId
        }
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

function initQueryGetJudges(queryData) {
    let query = 'select * from user_Judge';

    if (queryData) {
        if (queryData.competitionOperator === '==') {
            query += ' join competition_judge' +
                ' on user_Judge.id = competition_judge.idJudge' +
                ' where competition_judge.idCompetition = :compId';
        } else if (queryData.competitionOperator === '!=') {
            query += ' except' +
                ' select user_Judge.* from user_Judge' +
                ' join competition_judge' +
                ' on user_Judge.id = competition_judge.idJudge' +
                ' where competition_judge.idCompetition = :compId';
        }
    }

    return query
}

async function getRegisteredJudgeForCompetition(compId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `select  idJudge,firstname,lastname ,isMaster from competition_judge join user_Judge on competition_judge.idJudge = user_Judge.id where idCompetition = :compId;`,
        params: {
            compId: compId
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}


module.exports.insertJudgeToCompetitionDB = insertJudgeToCompetitionDB
module.exports.deleteJudgeFromCompetitionDB = deleteJudgeFromCompetitionDB
module.exports.updateMasterToCompetition = updateMasterToCompetition
module.exports.getJudges = getJudges
module.exports.getRegisteredJudgeForCompetition = getRegisteredJudgeForCompetition