const checkUserData = require("../services/commonExcelDataCheck");

function validateSportClubDetails(data){
    let ans = new Object();
    ans.isPassed = true;
    let err = [];
    //clubName
    // if (!validator.matches(data.clubName, Constants.regexHebWithSpace))
    //     err.push(Constants.errorMsg.hebErr)
    // //address
    // if (!validator.matches(data.address, Constants.regexHebrewAndNumbers))
    //     err.push(Constants.errorMsg.hebErr)


    if (err.length != 0)
        ans.isPassed = false;
    ans.results = err;
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
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.clubAdded;
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

module.exports.validateSportClubDetails = validateSportClubDetails;
module.exports.addSportClub = addSportClub;
