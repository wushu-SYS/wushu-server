const constants = require('../../constants')
const validator = require('validator');
const amutaModule = require('../modules/amutaModule');

/**
 * validate club's data
 * @param data - the club details
 * @return {status, results}
 */
function validateSportAmutaDetails(data) {
    let ans = new Object();
    ans.isPassed = true;
    let err = [];
    ans.results = err;
    return ans;
}
async function checkAmutaExist(Id) {
    let ans = await amutaModule.getAmutasById(Id)
    if (ans.results == 0) {
        ans.status = constants.statusCode.notFound
        ans.results = {}
    }
    return ans
}
module.exports.validateSportAmutaDetails = validateSportAmutaDetails
module.exports.checkAmutaExist = checkAmutaExist