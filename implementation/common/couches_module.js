async function getCoaches() {
    let ans = new Object();
    await dbUtils.sql(`Select id, firstname, lastname, sportclub, photo from user_Coach`)
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
    await dbUtils.sql(`Select user_Coach.*, sportclub.name as club from user_Coach join sportclub on user_Coach.sportclub = sportclub.id Where user_Coach.id= @idCoach`)
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
