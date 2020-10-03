const constants = require('../../constants')

async function getAdmins() {
    let ans = new Object();
    await dbUtils.sql('Select * from user_Manger order by firstname')
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

async function deleteAdmin(id){
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`DELETE FROM user_UserTypes WHERE id = @id and usertype =@type;`)
                .parameter('id', tediousTYPES.Int, id)
                .parameter('type', tediousTYPES.Int, constants.userType.MANAGER)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM user_Manger WHERE id = @id;`)
                .parameter('id', tediousTYPES.Int, id)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.userDeleted;
            await trans.commitTransaction();
        })
        .fail(async function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            await trans.rollbackTransaction();
        })
    return ans;
}

module.exports.getAdmins = getAdmins
module.exports.deleteAdmin = deleteAdmin