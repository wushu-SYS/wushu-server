const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

async function getAdmins() {
    let ans = new Object();
    await dbConnection.query({
        sql: 'Select * from user_Manger order by firstname'
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

async function deleteAdmin(id) {
    let ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    await trans.query({
        sql: `DELETE FROM user_UserTypes WHERE id = :id and usertype =:type;`,
        params: {
            id: id,
            type: constants.userType.MANAGER
        }
    }).then(async function () {
        await trans.query({
            sql: `DELETE FROM user_Manger WHERE id = :id;`,
            params: {
                id: id
            }
        })
    }).then(async function (testResult) {
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.userDeleted;
        await trans.commit();
    }).catch(async function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
        await trans.rollback();
    })
    return ans;
}

module.exports.getAdmins = getAdmins
module.exports.deleteAdmin = deleteAdmin