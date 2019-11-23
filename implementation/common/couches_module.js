async function getCoaches() {
    let ans = new Object();
    await dbUtils.sql(`Select id, firstname, lastname, sportclub from user_Coach`)
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

async function getCoachProfileById(id) {
    let ans = new Object();
    await dbUtils.sql(`Select * from user_Coach Where id= @idCoach`)
        .parameter('idCoach', tediousTYPES.Int, id)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = results[0]
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

module.exports.getCoaches = getCoaches;
module.exports.getCoachProfileById=getCoachProfileById;
