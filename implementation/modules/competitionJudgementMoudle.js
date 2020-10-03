const constants = require("../../constants");

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

module.exports.insertSportsmanGrade = insertSportsmanGrade