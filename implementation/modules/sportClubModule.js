const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection
const common_func = require('../commonFunc')

async function getSportClubs(idCoach) {
    let ans = new Object();
    let query = 'Select * from sportclub order by name';
    if (idCoach != undefined)
        query = 'Select sportclub.* from sportclub left join user_Coach on sportclub.id = user_Coach.sportclub where user_Coach.id=:id order by sportclub.name'
    await dbConnection.query({
        sql: query,
        params: {id: idCoach}
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

async function getClubDetails(clubId) {
    let ans = new Object();
    await dbConnection.query({
        sql: 'Select sportclub.*, amuta.name as amutaName, aguda.name as agudaName, sport_center.name ergonName from sportclub' +
            ' join aguda on sportclub.agudaId = aguda.id' +
            ' join amuta on sportclub.amutaId = amuta.id' +
            ' join sport_center on sportclub.ergonId = sport_center.id' +
            ' where sportclub.id = :id',
        params: {id: clubId}
    }).then(async function (results) {
        results.results[0].status = common_func.setStatus(results.results[0].status);
        await dbConnection.query({
            sql: 'select id, firstname, lastname from user_Coach where sportclub = :id',
            params: {id: clubId}
        }).then(async function (resultsCoaches) {
            results.results[0].coaches = resultsCoaches.results;
            await dbConnection.query({
                sql: "select id, firstname, lastname from user_Sportsman where sportclub = :id",
                params: {
                    id: clubId
                }
            }).then(function (resultSportsmen) {
                results.results[0].sportsmen = resultSportsmen.results;
                ans.status = constants.statusCode.ok;
                ans.results = results.results[0]
            })
        })
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

/**
 * handle inserting new club to the db
 * :param data - the new club details
 * :return {status, results}
 */
async function addSportClub(data) {
    let ans = new Object();
    await dbConnection.query({
        sql: `insert into sportclub (name, phone, address, contactname, amutaId, agudaId, ergonId,contactcoach, phonecoach, facebook, instagram, website, moredata,status)
                        values (:name, :phone, :address, :contactname, :amutaId, :agudaId, :ergonId ,:contactcoach, :phonecoach, :facebook, :instagram, :website, :moredata,:status);`,
        params: {
            name: data.clubName,
            phone: data.phone,
            address: data.address,
            contactname: data.contactname,
            amutaId: data.amutaId ? data.amutaId : 999999999,
            agudaId: data.agudaId,
            ergonId: data.ergonId,
            contactcoach: data.contactcoach,
            phonecoach: data.phonecoach,
            facebook: data.facebook,
            instagram: data.instagram,
            website: data.website,
            moredata: data.moredata,
            status:data.status
            //photo: constants.defaultClubProfilePic
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.clubAdded;
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

async function updateSportClubDetails(sportClubDetails) {
    let ans = new Object();
    await dbConnection.query({
        sql: `update sportclub set name=:name,address =:address,contactname =:contactname ,phone=:phone ,amutaId= :amutaId ,agudaId =:agudaId
                    ,ergonId=:ergonId,status=:status where id = :id `,
        params: {
            name: sportClubDetails.name,
            phone: sportClubDetails.phone,
            address: sportClubDetails.address,
            contactname: sportClubDetails.contactname,
            amutaId: sportClubDetails.amutaId ? sportClubDetails.amutaId : 999999999,
            agudaId: sportClubDetails.agudaId,
            ergonId: sportClubDetails.ergonId,
            status: sportClubDetails.status,
            id: sportClubDetails.id
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.clubAdded;
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

async function updateSportClubPhoto(path, id) {
    sql = `UPDATE sportclub SET photo = :photo Where id= :id`;
    let ans = new Object();
    await dbConnection.query({
        sql: sql,
        params: {
            id: id,
            photo: path
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = "upload"

    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

async function deleteProfile(id) {
    let ans = new Object();
    await dbConnection.query({
        sql: `delete from sportclub where id = :id;`,
        params: {
            id: id
        }
    }).then(function(results) {
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.clubDeleted;
    }).catch(function(err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

module.exports.getSportClubs = getSportClubs
module.exports.getClubDetails = getClubDetails
module.exports.addSportClub = addSportClub
module.exports.updateSportClubDetails = updateSportClubDetails
module.exports.updateSportClubPhoto = updateSportClubPhoto
module.exports.deleteProfile = deleteProfile
