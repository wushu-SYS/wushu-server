let constants = require("../../constants");

async function getRegisteredJudgeForCompetition(compId) {
    let ans = new Object();
    await dbUtils.sql(`select  idJudge,firstname,lastname ,isMaster from competition_judge join user_Judge on competition_judge.idJudge = user_Judge.id where idCompetition = @compId;`)
        .parameter('compId', tediousTYPES.Int, compId)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

async function delJudgeFromCompetition(trans, judges, judgeId, i, compId) {
    if (judgeId != undefined)
        return trans.sql(`delete from competition_judge where idJudge = @idJudge and idCompetition = @compId`)
            .parameter('compId', tediousTYPES.Int, compId)
            .parameter('idJudge', tediousTYPES.Int, judgeId)
            .execute()
            .then(async function (testResult) {
                if (i < judges.length)
                    await delJudgeFromCompetition(trans, judges, judges[i + 1], (i + 1), compId)
                return testResult
            })
    return
}

async function deleteJudgesFromCompetition(compId, judges) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await delJudgeFromCompetition(trans, judges, judges[0], 0, compId)
                .then(async (result) => {
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.competitionUpdate;
                    await trans.commitTransaction();
                })
                .catch((err) => {
                    console.log(err)
                    ans.status = constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                })
        })
        .fail(function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })

    return ans
}


async function insertJudgeGradeForSportsman(details) {
    let judges = details.judges
    let finalGrade = details.avgGrade

    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await insertSportsmanGrade(trans, judges, judges[0], 0, details),
                await insertSportsmanFinalGrade(trans, finalGrade, details)
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

async function insertSportsmanGrade(trans, judges, judgeDetails, i, details) {
    return await trans.sql(`insert into competition_Judgment (sportsmanId, compId, categoryID, judgeId, grade) values (@sportsmanId , @compId,@categoryId,@judgeId,@grade)`)
        .parameter('sportsmanId', tediousTYPES.Int, details.idSportsman)
        .parameter('compId', tediousTYPES.Int, details.idComp)
        .parameter('categoryId', tediousTYPES.Int, details.idCategory)
        .parameter('judgeId', tediousTYPES.Int, judgeDetails.idJudge)
        .parameter('grade', tediousTYPES.Float, judgeDetails.grade)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < judges.length)
                await insertSportsmanGrade(trans, judges, judges[i + 1], i + 1, details)
            return testResult
        })
}
async function insertSportsmanGrades(trans, sportsmanGrades, sportsmanGrade, i){
    return await insertSportsmanGrade(trans, sportsmanGrade.judges, sportsmanGrade.judges[0], 0, sportsmanGrade)
        .then(async function (res) {
            if(i+1 < sportsmanGrades.length)
                await insertSportsmanGrades(trans, sportsmanGrades, sportsmanGrades[i+1], i+1)
            return res;
        })
}

async function insertSportsmanFinalGrade(trans, finalGrade, details) {
    return await trans.sql(`insert into competition_results (sportmanID, compID, categoryID, grade) VALUES  (@sportsmanId , @compId,@categoryId,@grade)`)
        .parameter('sportsmanId', tediousTYPES.Int, details.idSportsman)
        .parameter('compId', tediousTYPES.Int, details.idComp)
        .parameter('categoryId', tediousTYPES.Int, details.idCategory)
        .parameter('grade', tediousTYPES.Float, finalGrade)
        .execute()
        .then(async function (testResult) {
            return testResult
        })
}
async function insertSportsmanFinalGrades(trans, sportsmanGrades, i=0){
    return await insertSportsmanFinalGrade(trans, sportsmanGrades[i].avgGrade, sportsmanGrades[i])
        .then(async function (res) {
            if(i+1 < sportsmanGrades.length)
                await insertSportsmanFinalGrades(trans, sportsmanGrades,i+1)
            return res;
        })
}

async function manualCloseCompetition(idComp) {
    let ans = new Object();
    await dbUtils.sql(`update events_competition set status = @status where idCompetition =@idComp `)
        .parameter('idComp', tediousTYPES.Int, idComp)
        .parameter('status', tediousTYPES.NVarChar, constants.competitionStatus.close)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
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


    console.log("ss")

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

module.exports.getRegisteredJudgeForCompetition = getRegisteredJudgeForCompetition
module.exports.deleteJudgesFromCompetition = deleteJudgesFromCompetition
module.exports.insertJudgeGradeForSportsman = insertJudgeGradeForSportsman
module.exports.manualCloseCompetition = manualCloseCompetition
module.exports.uploadTaulloCompetitionGrade = uploadTaulloCompetitionGrade

