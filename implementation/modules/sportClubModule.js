const constants = require('../../constants')

async function getSportClubs(idCoach) {
    let ans = new Object();
    let query = 'Select * from sportclub order by name';
    if (idCoach != undefined)
        query = 'Select sportclub.* from sportclub left join user_Coach on sportclub.id = user_Coach.sportclub where user_Coach.id=@id order by sportclub.name'
    await dbUtils.sql(query)
        .parameter('id', tediousTYPES.Int, idCoach)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

async function getClubDetails(clubId){
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
                            ans.status = constants.statusCode.ok;
                            ans.results = results[0]
                        }).fail(function (err) {
                            ans.status = constants.statusCode.badRequest;
                            ans.results = err
                        })
                }).fail(function (err) {
                    ans.status = constants.statusCode.badRequest;
                    ans.results = err
                })
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

/**
 * handle inserting new club to the db
 * @param data - the new club details
 * @return {status, results}
 */
async function addSportClub(data){
    let ans = new Object();
    await dbUtils.sql(`insert into sportclub (name, phone, address, contactname, amutaId, agudaId, ergonId)
                        values (@name, @phone, @address, @contactname, @amutaId, @agudaId, @ergonId);`)
        .parameter('name', tediousTYPES.NVarChar, data.clubName)
        .parameter('phone', tediousTYPES.NVarChar, data.phone)
        .parameter('address', tediousTYPES.NVarChar, data.address)
        .parameter('contactname', tediousTYPES.NVarChar, data.contactname)
        .parameter('amutaId', tediousTYPES.Int, data.amutaId ? data.amutaId : 999999999)
        .parameter('agudaId', tediousTYPES.Int, data.agudaId)
        .parameter('ergonId', tediousTYPES.Int, data.ergonId)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.clubAdded;
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

async function updateSportClubDetails(sportClubDetails){
    let ans = new Object();
    await dbUtils.sql(`update sportclub set name=@name,address =@address,contactname =@contactname ,phone=@phone ,amutaId= @amutaId ,agudaId =@agudaId
                    ,ergonId=@ergonId where id = @id `)
        .parameter('name', tediousTYPES.NVarChar, sportClubDetails.name)
        .parameter('phone', tediousTYPES.NVarChar, sportClubDetails.phone)
        .parameter('address', tediousTYPES.NVarChar, sportClubDetails.address)
        .parameter('contactname', tediousTYPES.NVarChar, sportClubDetails.contactname)
        .parameter('amutaId', tediousTYPES.Int, sportClubDetails.amutaId ? sportClubDetails.amutaId : 999999999)
        .parameter('agudaId', tediousTYPES.Int, sportClubDetails.agudaId)
        .parameter('ergonId', tediousTYPES.Int, sportClubDetails.ergonId)
        .parameter('id', tediousTYPES.Int, sportClubDetails.id)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.clubAdded;
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}
module.exports.getSportClubs = getSportClubs
module.exports.getClubDetails = getClubDetails
module.exports.addSportClub = addSportClub
module.exports.updateSportClubDetails = updateSportClubDetails
