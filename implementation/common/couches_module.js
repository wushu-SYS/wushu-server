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

module.exports.getCoaches = getCoaches;
