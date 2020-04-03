async function getRegisteredJudgeForCompetition(compId){
    let ans = new Object();
    await dbUtils.sql(`select  idJudge,firstname,lastname from competition_judge join user_Judge on competition_judge.idJudge = user_Judge.id where idCompetition = @compId;`)
        .parameter('compId', tediousTYPES.Int, compId)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results =results
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

module.exports.getRegisteredJudgeForCompetition=getRegisteredJudgeForCompetition