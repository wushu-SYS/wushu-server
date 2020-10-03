const constants = require('../../constants')

async function getAmutas(idCoach) {
    let ans = new Object();
    await dbUtils.sql('Select * from amuta order by name')
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

module.exports.getAmutas = getAmutas