async function getJudgesToRegister() {
    let ans = new Object();
    await dbUtils.sql(`Select * from user_Coach where user_Coach.id not in (select user_Coach.id from user_Coach inner join user_Judge on user_Coach.id =user_Judge.id )`)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

module.exports.getJudgesToRegister = getJudgesToRegister;
