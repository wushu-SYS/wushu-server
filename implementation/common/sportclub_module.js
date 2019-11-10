async function getSportClubs(idCoach) {
    let ans = new Object();
    let query ='Select id,name from sportclub';
    if(idCoach!=undefined)
        query='Select sportclub.id,sportclub.name from sportclub left join user_Coach on sportclub.id = user_Coach.sportclub where user_Coach.id=@id;'
    await dbUtils.sql(query)
        .parameter('id', tediousTYPES.Int, idCoach)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    console.log(ans)
    return ans;
}

module.exports.getSportClubs = getSportClubs;
