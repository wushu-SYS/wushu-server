const constants = require('../../constants')
const bcrypt = require('bcryptjs');
const {getUserTypes} = require("./userTypesMoudle");
const dbConnection = require('../../dbUtils').dbConnection

async function insertPasswordDB(trans, users, userDetails, i, userType) {
    return trans.parallelQueries(
        [{
            sql: `INSERT INTO user_Passwords (id,password,isfirstlogin)
                      select * from (select :idUser as id, :password as password ,:isFirstLogin as isfirstlogin)
                      as tmp where not exists( select id,password,isfirstlogin from user_Passwords where id= :idUser);`
            , params: {
                idUser: parseInt(userDetails[constants.colRegisterSportsmanExcel.idSportsman]),
                password: bcrypt.hashSync(userDetails[constants.colRegisterSportsmanExcel.idSportsman].toString(), constants.saltRounds),
                isFirstLogin: 1
            }
        }, {
            sql:
                `insert into user_UserTypes (id, usertype) values (:idUser , :userType);`,
            params: {
                idUser: parseInt(userDetails[constants.colRegisterSportsmanExcel.idSportsman]), userType: userType,
            }
        }])
        .then(async function () {
            if (i + 1 < users.length)
                await insertPasswordDB(trans, users, users[i + 1], (i + 1), userType)
        })
}

async function checkUserDetailsForLogin(userData) {
    var ans = new Object();
    await dbConnection.query({
        sql: `select user_Passwords.*, usertype from user_Passwords join user_UserTypes on user_Passwords.id = user_UserTypes.id where user_Passwords.id = :id`,
        params: {id: userData.userID}
    })
        .then(function (results) {
            results = results.results
            if (results.length === 0) {
                ans.isPassed = false;
                ans.err = constants.errorMsg.errLoginDetails
            } else {
                let userTypes = results.map(u => u.usertype)
                ans.dbResults = results[0];
                ans.dbResults.usertype = userTypes;
                ans.isPassed = bcrypt.compareSync(userData.password, results[0].password);
            }
        }).catch(function (err) {
            console.log(err)
            ans.isPassed = false;
            ans.err = err;
        });
    return ans;

}

async function changeUserPassword(userData) {
    let ans = new Object();
    await dbConnection.query({
        sql: `UPDATE user_Passwords SET password = :newPassword, isFirstLogin = 0 where id =:id`,
        params: {newPassword: bcrypt.hashSync(userData.newPass, constants.saltRounds), id: userData.id}
    })
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.passUpdated
        }).catch(function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans

}


async function validateDiffPass(userData) {
    var ans = new Object()
    await dbConnection.query({
        sql: `Select password from user_Passwords where id= :id`,
        params: {id: userData.id}
    })
        .then(function (results) {
            results = results.results
            if (bcrypt.compareSync(userData.newPass, results[0].password)) {
                ans.status = constants.statusCode.Conflict;
                ans.isPassed = false;
                ans.err = constants.errorMsg.samePassword
            } else {
                ans.status = constants.statusCode.ok;
                ans.isPassed = true;
                ans.err = results
            }
        }).catch(function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.isPassed = false;
            ans.err = err
        });
    return ans;
}

async function deletePassword(userId) {
    let userTypes = await getUserTypes(userId)
    if (userTypes.status == constants.statusCode.ok && userTypes.results.length == 0) {
        await dbConnection.query({
            sql: `DELETE FROM user_Passwords WHERE id = :id;`,
            params: {id: userId}
        })
            .then((res) => {
                console.log("[Log] - user password for user id " + userId + "has been deleted")
            })
            .catch((err) => {
                console.log(err)
            })
    }
}

module.exports.checkUserDetailsForLogin = checkUserDetailsForLogin
module.exports.validateDiffPass = validateDiffPass
module.exports.insertPasswordDB = insertPasswordDB
module.exports.changeUserPassword = changeUserPassword
module.exports.deletePassword = deletePassword