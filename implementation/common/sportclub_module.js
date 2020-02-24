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

async function getDetails(clubId){
    let ans = new Object();
    await dbUtils.sql('Select sportclub.*, amuta.name as amutaName, aguda.name as agudaName, sport_center.name ergonName from sportclub' +
        ' join aguda on sportclub.agudaId = aguda.id' +
        ' join amuta on sportclub.amutaId = amuta.id' +
        ' join sport_center on sportclub.ergonId = sport_center.id' +
        ' where sportclub.id = @id')
        .parameter('id', tediousTYPES.Int, clubId)
        .execute()
        .then(async function (results) {
            await dbUtils.sql('select id, firstname, lastname from user_Coach where sportclub = @id')
                .parameter('id', tediousTYPES.Int, clubId)
                .execute()
                .then(async function (resultsCoaches) {
                    results[0].coaches = resultsCoaches;
                    await dbUtils.sql("select id, firstname, lastname from user_Sportsman where sportclub = @id")
                        .parameter('id', tediousTYPES.Int, clubId)
                        .execute()
                        .then(function (resultSportsmen) {
                            results[0].sportsmen = resultSportsmen;
                            ans.status = Constants.statusCode.ok;
                            ans.results = results[0]
                        }).fail(function (err) {
                            ans.status = Constants.statusCode.badRequest;
                            ans.results = err
                        })
                }).fail(function (err) {
                    ans.status = Constants.statusCode.badRequest;
                    ans.results = err
                })
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
module.exports.getDetails = getDetails;
