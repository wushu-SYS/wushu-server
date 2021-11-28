const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

async function getAddresses() {
    let ans = new Object();
    await dbConnection.query({
        sql: 'SELECT DISTINCT address FROM sportclub order by address;'
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

module.exports.getAddresses = getAddresses