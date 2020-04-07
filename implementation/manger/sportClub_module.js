const checkUserData = require("../services/commonExcelDataCheck");
const constants = require("../../constants")

/**
 * validate club's data
 * @param data - the club details
 * @return {status, results}
 */
function validateSportClubDetails(data){
    let ans = new Object();
    ans.isPassed = true;
    let err = [];

    //address
    if (!validator.matches(data.address, Constants.regexHebrewAndNumbers))
        err.push(Constants.errorMsg.hebErr);
    //phone
    if(!(validator.isInt(data.phone.toString()) && data.phone.toString().length === 10))
        err.push(Constants.errorMsg.sportClubContactPhoneErr);

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
module.exports.validateSportClubDetails = validateSportClubDetails;
module.exports.addSportClub = addSportClub;
module.exports.updateSportClubDetails = updateSportClubDetails;

