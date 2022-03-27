const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

async function addSportAmuta(data) {
    let ans = new Object();
    await dbConnection.query({
        sql: `insert into amuta (id, name)
                        values (:id, :name);`,
        params: {
            id : data.Id,
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

module.exports.getAmutas = getAmutas
module.exports.getAmutasById = getAmutasById
module.exports.addSportAmuta = addSportAmuta