async function getSportClubs(idCoach) {
    let ans = new Object();
    let query ='Select * from sportclub order by name';
    if(idCoach!=undefined)
        query='Select sportclub.* from sportclub left join user_Coach on sportclub.id = user_Coach.sportclub where user_Coach.id=@id order by sportclub.name'
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
    return ans;
}

async function getErgons(idCoach) {
    let ans = new Object();
    await dbUtils.sql('Select * from sport_center order by name')
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

async function getAmutas(idCoach) {
    let ans = new Object();
    await dbUtils.sql('Select * from amuta order by name')
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

async function getAgudas(idCoach) {
    let ans = new Object();
    await dbUtils.sql('Select * from aguda order by name')
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
module.exports.getErgons = getErgons;
module.exports.getAmutas = getAmutas;
module.exports.getAgudas = getAgudas;
