const constants = require('../../constants')
const bcrypt = require('bcryptjs');

async function insertPasswordDB(trans, users, userDetails, i, userType) {
    return trans.sql(`INSERT INTO user_Passwords (id,password,isfirstlogin)
                      select * from (select @idUser as id, @password as password ,@isFirstLogin as isfirstlogin)
                      as tmp where not exists( select id,password,isfirstlogin from user_Passwords where id= @idUser);
                      insert into user_UserTypes (id, usertype) values (@idUser ,@userType);`)
        .parameter('idUser', tediousTYPES.Int, userDetails[constants.colRegisterSportsmanExcel.idSportsman])
        .parameter('password', tediousTYPES.NVarChar, bcrypt.hashSync(userDetails[constants.colRegisterSportsmanExcel.idSportsman].toString(), constants.saltRounds))
        .parameter('userType', tediousTYPES.Int, userType)
        .parameter('isFirstLogin', tediousTYPES.Int, 1)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertPasswordDB(trans, users, users[i + 1], (i + 1), userType)
            return testResult
        })
}

async function checkUserDetailsForLogin(userData) {
    var ans = new Object();
    await dbUtils.sql(`select user_Passwords.*, usertype from user_Passwords join user_UserTypes on user_Passwords.id = user_UserTypes.id where user_Passwords.id = @id`)
        .parameter('id', tediousTYPES.Int, userData.userID)
        .execute()
        .then(function (results) {
            if (results.length === 0) {
                ans.isPassed = false;
                ans.err = constants.errorMsg.errLoginDetails
            } else {
                let userTypes = results.map(u => u.usertype)
                ans.dbResults = results[0];
                ans.dbResults.usertype = userTypes;
                ans.isPassed = bcrypt.compareSync(userData.password, results[0].password);
            }
        }).fail(function (err) {
            ans.isPassed = false;
            ans.err = err;
        });
    return ans;

}

async function changeUserPassword(userData) {
    let ans = new Object();
    await dbUtils.sql(`UPDATE user_Passwords SET password = @newPassword, isFirstLogin = 0 where id =@id`)
        .parameter('newPassword', tediousTYPES.NVarChar, bcrypt.hashSync(userData.newPass, constants.saltRounds))
        .parameter('id', tediousTYPES.Int, userData.id)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.passUpdated
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans

}


async function validateDiffPass(userData) {
    var ans = new Object()
    await dbUtils.sql(`Select password from user_Passwords where id= @id`)
        .parameter('id', tediousTYPES.Int, userData.id)
        .execute()
        .then(function (results) {
            if (bcrypt.compareSync(userData.newPass, results[0].password)) {
                ans.status = constants.statusCode.Conflict;
                ans.isPassed = false;
                ans.err = constants.errorMsg.samePassword
            } else {
                ans.status = constants.statusCode.ok;
                ans.isPassed = true;
                ans.err = results
            }
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.isPassed = false;
            ans.err = err
        });
    return ans;
}
async function deletePassword(userId){
    let userTypes = await getUserTypes(userId)
    if (userTypes.status == constants.statusCode.ok && userTypes.results.length == 0){
        await dbUtils.sql(`DELETE FROM user_Passwords WHERE id = @id;`)
            .parameter('id', tediousTYPES.Int, userId)
            .execute()
            .then((res)=>{console.log("[Log] - user password for user id " + userId + "has been deleted")})
            .catch((err)=>{console.log(err)})
    }
}

module.exports.checkUserDetailsForLogin=checkUserDetailsForLogin
module.exports.validateDiffPass=validateDiffPass
module.exports.insertPasswordDB=insertPasswordDB
module.exports.changeUserPassword=changeUserPassword
module.exports.deletePassword=deletePassword