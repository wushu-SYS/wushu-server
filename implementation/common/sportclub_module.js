async function getSportClubs() {
    let ans = new Object();
    await dbUtils.sql(`Select id,name from sportclub`)
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

module.exports.getSportClubs = getSportClubs;
