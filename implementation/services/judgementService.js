const constants = require("../../constants");
const competitionJudgementModule = require('../modules/competitionJudgementMoudle')
const competitionResultsModule = require('../modules/competitionResultsModule')

async function insertJudgeGradeForSportsman(details) {
    let judges = details.judges
    let finalGrade = details.avgGrade

    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await competitionJudgementModule.insertSportsmanGrade(trans, judges, judges[0], 0, details),
                await competitionResultsModule.insertSportsmanFinalGrade(trans, finalGrade, details)
                    .then((result) => {
                        ans.status = constants.statusCode.ok;
                        ans.results = constants.msg.competitionUpdate;
                        trans.commitTransaction();
                    })
                    .catch((err) => {
                        console.log(err)
                        ans.status = constants.statusCode.badRequest;
                        ans.results = err;
                        trans.rollbackTransaction();
                    }))
        })
        .fail(function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans

}

async function uploadTaulloCompetitionGrade(users, idComp, judges, numOfJudge) {
    let userGradeArray = getDataUploadTaulloCompetitionGrades(users, idComp, judges, numOfJudge)

    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await insertSportsmanGrades(trans, userGradeArray, userGradeArray[0], 0),
                await insertSportsmanFinalGrades(trans, userGradeArray)
                    .then((result) => {
                        ans.status = constants.statusCode.ok;
                        ans.results = constants.msg.competitionUpdate;
                        trans.commitTransaction();
                    })
                    .catch((err) => {
                        console.log(err)
                        ans.status = constants.statusCode.badRequest;
                        ans.results = err;
                        trans.rollbackTransaction();
                    }))
        })
        .fail(function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans
}

async function insertSportsmanGrades(trans, sportsmanGrades, sportsmanGrade, i){
    return await competitionJudgementModule.insertSportsmanGrade(trans, sportsmanGrade.judges, sportsmanGrade.judges[0], 0, sportsmanGrade)
        .then(async function (res) {
            if(i+1 < sportsmanGrades.length)
                await insertSportsmanGrades(trans, sportsmanGrades, sportsmanGrades[i+1], i+1)
            return res;
        })
}
async function insertSportsmanFinalGrades(trans, sportsmanGrades, i=0){
    return await competitionResultsModule.insertSportsmanFinalGrade(trans, sportsmanGrades[i].avgGrade, sportsmanGrades[i])
        .then(async function (res) {
            if(i+1 < sportsmanGrades.length)
                await insertSportsmanFinalGrades(trans, sportsmanGrades,i+1)
            return res;
        })
}



async function updateCompetitionGrades(sportsman,compId) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await competitionResultsModule.updateSportsmanCompetitionGrade(trans, sportsman, sportsman[0], 0,compId)
                .then((result) => {
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.competitionUpdate;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                })
        })
        .fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        });

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