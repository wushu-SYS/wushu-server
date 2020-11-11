const constants = require('../../constants')
const validator = require('validator');

/**
 * validate club's data
 * @param data - the club details
 * @return {status, results}
 */
function validateSportClubDetails(data) {
    let ans = new Object();
    ans.isPassed = true;
    let err = [];

    //address
    if (!validator.matches(data.address, constants.constRegex.regexHebrewAndNumbers))
        err.push(constants.errorMsg.hebErr);
    //phone
    if (!(validator.isInt(data.phone.toString()) && data.phone.toString().length === 10))
        err.push(constants.errorMsg.sportClubContactPhoneErr);

    if (err.length != 0)
        ans.isPassed = false;
    ans.results = err;
    return ans;
}

module.exports.validateSportClubDetails = validateSportClubDetails