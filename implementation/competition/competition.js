const constants = require("../../constants")
tediousTYPES = require('tedious').TYPES;

async function updateCompetitionGrades(sportsman,compId) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await updateSportsmanCompetitionGrade(trans, sportsman, sportsman[0], 0,compId)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.competitionUpdate;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                }))
        })
        .fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        });

    return ans
}
async function updateSportsmanCompetitionGrade(trans,sportsman,sportsmanDetails,i,compId){
    return trans.sql(`update competition_results set grade =@grade where compID =@compId and sportmanID=@sportsmanId and categoryID = @categoryId`)
        .parameter('grade', tediousTYPES.Int, sportsmanDetails.sportsmanId)
        .parameter('compId',  tediousTYPES.Int, compId)
        .parameter('sportsmanId',  tediousTYPES.Int, sportsmanDetails.categoryId)
        .parameter('categoryId',  tediousTYPES.Float, sportsmanDetails.grade)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < sportsman.length)
                await updateSportsmanCompetitionGrade(trans, sportsman, sportsman[i + 1], i + 1,compId)
            return testResult
        })
}

module.exports.updateCompetitionGrades=updateCompetitionGrades
