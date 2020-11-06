const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

async function getAgudas() {
    let ans = new Object();
    await dbConnection.query({sql: 'Select * from aguda order by name'})
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results.results
        }).catch(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

module.exports.getAgudas = getAgudas