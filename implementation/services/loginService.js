jwt = require("jsonwebtoken");
const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

function buildToken(userDetails, userData) {
    let payload = {id: userData.dbResults.id, name: userDetails.firstname, access: userData.dbResults.usertype};
    let options = {expiresIn: "1d"};
    const token = jwt.sign(payload, constants.secret, options);
    return {
        'token': token,
        'id': userData.dbResults.id,
        'firstname': userDetails.firstname,
        'lastname': userDetails.lastname,
        'access': userData.dbResults.usertype,
        'isFirstTime': userData.dbResults.isfirstlogin,
        'sportclub': userDetails.sportclub
    };
}

async function getUserDetails(userData) {
    let result;
    switch (userData.dbResults.usertype) {
        case 1:
            result = await dbConnection.query({sql:`select firstname, lastname from user_Manger where id= '${userData.dbResults.id}'`});
            break;
        case 2:
            result = await dbConnection.query({sql:`select firstname, lastname , sportclub from user_Coach where id= '${userData.dbResults.id}'`});
            break;
        case 3:
            result = await dbConnection.query({sql:`select firstname, lastname from user_Sportsman where id= '${userData.dbResults.id}'`});
            break;
        case 4:
            result = await dbConnection.query({sql:`select firstname, lastname from user_Judge where id= '${userData.dbResults.id}'`});
            break;
    }
    return result.results[0]

}

module.exports.getUserDetails = getUserDetails
module.exports.buildToken = buildToken