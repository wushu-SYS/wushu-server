let constants = require("../../constants");

async function getRegisteredJudgeForCompetition(compId) {
    let ans = new Object();
    await dbUtils.sql(`select  idJudge,firstname,lastname from competition_judge join user_Judge on competition_judge.idJudge = user_Judge.id where idCompetition = @compId and isMaster= 0;`)
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


async function insertJudgeGradeForSportsman (details){
    let judges = details.judges
    let finalGrade = details.avgGrade

    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all( await insertSportsmanGrade(trans, judges, judges[0], 0,details),
                await insertSportsmanFinalGrade(trans,finalGrade,details)
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

async function insertSportsmanGrade(trans,judges,judgeDetails,i,details){
            return await trans.sql(`insert into competition_Judgment (sportsmanId, compId, categoryID, judgeId, grade) values (@sportsmanId , @compId,@categoryId,@judgeId,@grade)`)
                .parameter('sportsmanId', tediousTYPES.Int, details.idSportsman)
                .parameter('compId', tediousTYPES.Int, details.idComp)
                .parameter('categoryId', tediousTYPES.Int, details.idCategory)
                .parameter('judgeId', tediousTYPES.Int, judgeDetails.idJudge)
                .parameter('grade', tediousTYPES.Float, judgeDetails.grade )
                .execute()
                .then(async function (testResult) {
                    if (i + 1 < judges.length)
                        await insertSportsmanGrade(trans, judges, judges[ i+  1], i + 1,details)
                    return testResult
        })
}

async function insertSportsmanFinalGrade(trans,finalGrade,details) {
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


module.exports.getRegisteredJudgeForCompetition = getRegisteredJudgeForCompetition
module.exports.deleteJudgesFromCompetition = deleteJudgesFromCompetition
module.exports.insertJudgeGradeForSportsman = insertJudgeGradeForSportsman