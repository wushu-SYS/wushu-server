const constants = require("../../constants");
const dbConnection = require('../../dbUtils').dbConnection

async function insertSportsmanGrade(trans, judges, judgeDetails, i, details) {
    return await trans.query({
        sql: `insert into competition_Judgment (sportsmanId, compId, categoryID, judgeId, grade) values (:sportsmanId , :compId,:categoryId,:judgeId,:grade)`,
        params: {
            sportsmanId: details.idSportsman,
            compId: details.idComp,
            categoryId: details.idCategory,
            judgeId: judgeDetails.idJudge,
            grade: judgeDetails.grade
        }
    }).then(async function () {
        if (i + 1 < judges.length)
            await insertSportsmanGrade(trans, judges, judges[i + 1], i + 1, details)
    })
}

module.exports.insertSportsmanGrade = insertSportsmanGrade