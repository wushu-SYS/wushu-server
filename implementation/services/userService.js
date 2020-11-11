const constants = require('../../constants')
const userTypesModule = require('../modules/userTypesMoudle')
const {dbConnection} = require("../../dbUtils");

async function checkUserExist(userId) {
    let ans = await userTypesModule.checkUserTypes(userId)
    if (ans.results == 0) {
        ans.status = constants.statusCode.notFound
        ans.results = {}
    }
    return ans
}

async function updateProfilePic(path, id, userType) {
    let sql = getSqlUpdatePic(userType);
    let ans = new Object();
    await dbConnection.query({
        sql: sql,
        params: {
            id: id,
            photo: path
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = "upload"

    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

function getSqlUpdatePic(userType) {
    switch (userType) {
        case constants.userType.JUDGE:
            return `update ${constants.databaseUserTableName.judge} set photo =:photo where id = :id`;
        case constants.userType.SPORTSMAN:
            return `update ${constants.databaseUserTableName.sportsman} set photo =:photo where id = :id`;
        case constants.userType.COACH:
            return `update ${constants.databaseUserTableName.coach} set photo =:photo where id = :id`;

    }
}

module.exports.checkUserExist = checkUserExist
module.exports.updateProfilePic = updateProfilePic