const constants = require("../../constants");
const competitionJudgementModule = require('../modules/competitionJudgementMoudle')
const competitionResultsModule = require('../modules/competitionResultsModule')
const dbConnection = require('../../dbUtils').dbConnection

async function insertJudgeGradeForSportsman(details) {
    let judges = details.judges
    let finalGrade = details.avgGrade
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    await competitionJudgementModule.insertSportsmanGrade(trans, judges, judges[0], 0, details)
        .then(async () => {
            await competitionResultsModule.insertSportsmanFinalGrade(trans, finalGrade, details)
                .then((result) => {
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.competitionUpdate;
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

async function uploadTaulloCompetitionGrade(users, idComp, judges, numOfJudge) {
    let userGradeArray = getDataUploadTaulloCompetitionGrades(users, idComp, judges, numOfJudge)
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    await insertSportsmanGrades(trans, userGradeArray, userGradeArray[0], 0)
        .then(async () => {
            await insertSportsmanFinalGrades(trans, userGradeArray)
                .then((result) => {
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.competitionUpdate;
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

async function insertSportsmanGrades(trans, sportsmanGrades, sportsmanGrade, i) {
    return await competitionJudgementModule.insertSportsmanGrade(trans, sportsmanGrade.judges, sportsmanGrade.judges[0], 0, sportsmanGrade)
        .then(async function (res) {
            if (i + 1 < sportsmanGrades.length)
                await insertSportsmanGrades(trans, sportsmanGrades, sportsmanGrades[i + 1], i + 1)
            return res;
        })
}

async function insertSportsmanFinalGrades(trans, sportsmanGrades, i = 0) {
    return await competitionResultsModule.insertSportsmanFinalGrade(trans, sportsmanGrades[i].avgGrade, sportsmanGrades[i])
        .then(async function (res) {
            if (i + 1 < sportsmanGrades.length)
                await insertSportsmanFinalGrades(trans, sportsmanGrades, i + 1)
            return res;
        })
}


async function updateCompetitionGrades(sportsman, compId) {
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    await competitionResultsModule.updateSportsmanCompetitionGrade(trans, sportsman, sportsman[0], 0, compId)
        .then((result) => {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.competitionUpdate;
            trans.commit();
        }).catch((err) => {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollback();
        })

    return ans
}


function getDataUploadTaulloCompetitionGrades(users, idComp, judges, numOfJudge) {
    let userGradeArray = []
    users.forEach((user) => {
        let idCategory = extractCategoryIdFromExcelCompetitionGrade(user[constants.colUploadExcelTaulloCompetitionGrade.category])
        let judgesGrade = []
        for (let i = 0; i < numOfJudge; i++)
            judgesGrade.push({
                idJudge: judges[i].idJudge,
                grade: parseFloat(user[constants.colUploadExcelTaulloCompetitionGrade.firstJudge + i])
            })
        userGradeArray.push({
            idComp: idComp,
            idSportsman: user[constants.colUploadExcelTaulloCompetitionGrade.idSportsman],
            idCategory: idCategory,
            judges: judgesGrade,
            avgGrade: user[user.length - 1]
        })
    })
    return userGradeArray;
}

function extractCategoryIdFromExcelCompetitionGrade(line) {
    line = line.split('=')
    let idCategory = line[line.length - 1].substring(1, line[line.length - 1].length - 1)
    return idCategory
}

module.exports.insertJudgeGradeForSportsman = insertJudgeGradeForSportsman
module.exports.uploadTaulloCompetitionGrade = uploadTaulloCompetitionGrade
module.exports.updateCompetitionGrades = updateCompetitionGrades