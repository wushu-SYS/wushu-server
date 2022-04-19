const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

async function addSportAmuta(data) {
    let ans = new Object();
    await dbConnection.query({
        sql: `insert into amuta (id, name)
                        values (:id, :name);`,
        params: {
            id : data.id,
            name: data.amutaName
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.amutaAdded;
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

async function getAmutas() {
    let ans = new Object();
    await dbConnection.query({
        sql: 'Select * from amuta order by name'
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
async function deleteProfile(id){
    let ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    await trans.query({
        
        sql: `DELETE FROM amuta WHERE id = :id;`,
        params: {
            id: id
        }
    })
    .then(async () => {
        //TODO: delete sportsman directory on drive - job name deleteSportsmanFilesFromGoogleDrive
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.userDeleted;
        await trans.commit();
    })
    .catch((err) => {
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
        console.log(err)
        trans.rollback()
    })
    return ans;
}
async function getAmutasById(Id) {
    let ans = new Object()
    await dbConnection.query({
        sql: `select * from amuta where id = :id`,
        params: {
            id: Id
        }
    }).then(async function (results) {
        if (results.results.length === 0) {
            ans.results = 0
        } else {
            results = results.results
            ans.status = constants.statusCode.ok;
            ans.results = results[0]
        }
    }).catch(function (err) {
        console.log(err)
        ans.results = err;
    });
    return ans;
}

async function updateSportAmutaDetails(sportAmutaDetails) {
    let ans = new Object();
    await dbConnection.query({
        sql: `update amuta set name=:name,id=:id where id = :id `,
        params: {
            name: sportAmutaDetails.name,
            id: sportAmutaDetails.id
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.amutaAdded;
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

module.exports.getAmutas = getAmutas
module.exports.deleteProfile = deleteProfile
module.exports.getAmutasById = getAmutasById
module.exports.addSportAmuta = addSportAmuta
module.exports.updateSportAmutaDetails = updateSportAmutaDetails
