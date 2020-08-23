let constants = require("../../constants");
let common_sportsman_module = require("../common/sportsman_module")
let common_couches_module = require("../common/coaches_module")
let common_judge_module = require("../common/judge_module")

async function checkUserDetailsForLogin(userData) {
    var ans = new Object();
    await dbUtils.sql(`select user_Passwords.*, usertype from user_Passwords join user_UserTypes on user_Passwords.id = user_UserTypes.id where user_Passwords.id = @id`)
        .parameter('id', tediousTYPES.Int, userData.userID)
        .execute()
        .then(function (results) {
            if (results.length === 0) {
                ans.isPassed = false;
                ans.err = Constants.errorMsg.errLoginDetails
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

async function checkUserExist(userId) {
    let ans = await checkUserTypes(userId)
    if (ans.results == 0) {
        ans.status = constants.statusCode.notFound
        ans.results ={}
    }
    return ans
}

async function checkUserTypes(userId) {
    let ans = new Object()
    await dbUtils.sql(`select usertype from user_UserTypes where id = @id`)
        .parameter('id', tediousTYPES.Int, userId)
        .execute()
        .then(async function (results) {
            if (results.length === 0) {
                ans.results = 0
            } else {
                if (checkUserTypeSportsman(results)) {
                    ans = await common_sportsman_module.sportsmanProfile(userId)
                } else if (checkUserTypeCoach(results)) {
                    ans = await common_couches_module.getCoachProfileById(userId)
                } else if (checkUserTypeJudge(results)) {
                    ans = await common_judge_module.getRefereeProfileById(userId);
                }
            }
        })
        .fail(function (err) {
            ans.results = err;
        });
    return ans;
}

function checkUserTypeSportsman(results) {
    for (let i = 0; i < results.length; i++) {
        if (results[i].usertype == constants.userType.SPORTSMAN)
            return true
    }
    return false
}

function checkUserTypeCoach(results) {
    for (let i = 0; i < results.length; i++) {
        if (results[i].usertype == constants.userType.COACH)
            return true
    }
    return false
}

function checkUserTypeJudge(results) {
    for (let i = 0; i < results.length; i++) {
        if (results[i].usertype == constants.userType.JUDGE)
            return true
    }
    return false
}


async function getUserDetails(userData) {
    let result;
    switch (userData.dbResults.usertype) {
        case 1:
            result = await dbUtils.sql(`select firstname, lastname from user_Manger where id= '${userData.dbResults.id}'`).execute();
            break;
        case 2:
            result = await dbUtils.sql(`select firstname, lastname , sportclub from user_Coach where id= '${userData.dbResults.id}'`).execute();
            break;
        case 3:
            result = await dbUtils.sql(`select firstname, lastname from user_Sportsman where id= '${userData.dbResults.id}'`).execute();
            break;
        case 4:
            result = await dbUtils.sql(`select firstname, lastname from user_Judge where id= '${userData.dbResults.id}'`).execute();
            break;
    }
    return result[0]

}

function buildToken(userDetails, userData) {
    payload = {id: userData.dbResults.id, name: userDetails.firstname, access: userData.dbResults.usertype};
    options = {expiresIn: "1d"};
    const token = jwt.sign(payload, secret, options);
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


async function validateDiffPass(userData) {
    var ans = new Object()
    await dbUtils.sql(`Select password from user_Passwords where id= @id`)
        .parameter('id', tediousTYPES.Int, userData.id)
        .execute()
        .then(function (results) {
            if (bcrypt.compareSync(userData.newPass, results[0].password)) {
                ans.status = Constants.statusCode.Conflict;
                ans.isPassed = false;
                ans.err = Constants.errorMsg.samePassword
            } else {
                ans.status = Constants.statusCode.ok;
                ans.isPassed = true;
                ans.err = results
            }
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.isPassed = false;
            ans.err = err
        });
    return ans;
}

async function changeUserPassword(userData) {
    let ans = new Object();
    await dbUtils.sql(`UPDATE user_Passwords SET password = @newPassword, isFirstLogin = 0 where id =@id`)
        .parameter('newPassword', tediousTYPES.NVarChar, bcrypt.hashSync(userData.newPass, saltRounds))
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


async function deleteSportsman(sportsmanId) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`DELETE FROM user_Passwords WHERE id = @sportsmanId;`)
                .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM user_Sportsman WHERE id = @sportsmanId;`)
                .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            //TODO: delete sportsman directory on drive - job name deleteSportsmanFilesFromGoogleDrive
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.userDeleted;
            trans.commitTransaction();
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans;
}


async function updateProfilePic(path, id, userType) {
    let sql = getSqlUpdatePic(userType);
    let ans = new Object();
    await dbUtils.sql(sql)
        .parameter('id', tediousTYPES.Int, id)
        .parameter('photo', tediousTYPES.NVarChar, path)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = "upload"

        }).fail(function (err) {
            console.log(err)
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

function getSqlUpdatePic(userType) {
    switch (userType) {
        case "judge":
            return `update ${constants.databaseUserTableName.judge} set photo =@photo where id = @id`;
        case "sportsman":
            return `update ${constants.databaseUserTableName.sportsman} set photo =@photo where id = @id`;
        case "coach":
            return `update ${constants.databaseUserTableName.coach} set photo =@photo where id = @id`;

    }
}


async function getUserTypes(userId) {
    let ans = new Object()
    await dbUtils.sql(`select usertype from user_UserTypes where id = @id`)
        .parameter('id', tediousTYPES.Int, userId)
        .execute()
        .then(async function (results) {
            ans.results = results
            ans.status = constants.statusCode.ok
        })
        .fail(function (err) {
            ans.results = err;
            ans.status = constants.statusCode.badRequest
        });
    return ans;
}

module.exports.buildToken = buildToken;
module.exports.checkUserDetailsForLogin = checkUserDetailsForLogin;
module.exports.getUserDetails = getUserDetails;
module.exports.changeUserPassword = changeUserPassword;
module.exports.deleteSportsman = deleteSportsman;
module.exports.validateDiffPass = validateDiffPass;
module.exports.updateProfilePic = updateProfilePic;
module.exports.checkUserExist = checkUserExist;
module.exports.getUserTypes = getUserTypes;

module.exports.checkUserTypes = checkUserTypes;
