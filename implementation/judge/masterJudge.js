async function getRegisteredJudgeForCompetition(compId) {
    let ans = new Object();
    await dbUtils.sql(`select  idJudge,firstname,lastname from competition_judge join user_Judge on competition_judge.idJudge = user_Judge.id where idCompetition = @compId and isMaster= 0;`)
        .parameter('compId', tediousTYPES.Int, compId)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}


async function delJudgeFromCompetition(trans, judges, judgeId, i, compId) {
    return trans.sql(`delete from competition_judge where idJudge= @idJudge and idCompetition =@compId`)
        .parameter('compId', tediousTYPES.Int, compId)
        .parameter('idJudge', tediousTYPES.Int,judgeId)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < judges.length)
                await delJudgeFromCompetition(trans, judges, judges[i + 1], (i + 1))
            return testResult
        })
}

async function deleteJudgesFromCompetition(compId, judges) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await delJudgeFromCompetition(trans, judges, judges[0], 0, compId)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = constants.statusCode.ok;
                    ans.results = constants.msg.competitionUpdate;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = constants.statusCode.badRequest;
                    ans.results = err;
                    console.log(err)
                    trans.rollbackTransaction();
                }))
        })
        .fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            console.log(err)

            trans.rollbackTransaction();
        })

    return ans
}


module.exports.getRegisteredJudgeForCompetition = getRegisteredJudgeForCompetition
module.exports.deleteJudgesFromCompetition = deleteJudgesFromCompetition