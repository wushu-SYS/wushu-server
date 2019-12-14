async function getJudgesToRegister() {
    let ans = new Object();
    await dbUtils.sql(`Select * from user_Coach where user_Coach.id not in (select user_Coach.id from user_Coach inner join user_Judge on user_Coach.id =user_Judge.id )`)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

async function getReferees() {
    let ans = new Object();
    await dbUtils.sql(`Select * from user_Judge`)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;

}
async function getRefereeProfileById(id) {
    let ans = new Object();
    await dbUtils.sql(`Select * from user_Judge Where id= @idJudge`)
        .parameter('idJudge', tediousTYPES.Int, id)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = results[0]
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

async function updateRefereeProfile(CoachData) {
    let ans = new Object();
    await dbUtils.sql(`UPDATE user_Judge SET id =@id, firstname = @firstName, lastname = @lastName, phone = @phone, email = @email where id =@oldId;`)
        .parameter('id', tediousTYPES.Int, CoachData[0])
        .parameter('firstName', tediousTYPES.NVarChar, CoachData[1])
        .parameter('lastName', tediousTYPES.NVarChar, CoachData[2])
        .parameter('phone', tediousTYPES.NVarChar, CoachData[3])
        .parameter('email', tediousTYPES.NVarChar, CoachData[4])
        .parameter('oldId', tediousTYPES.Int, CoachData[5])
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.updateUserDetails;
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

module.exports.getReferees = getReferees;
module.exports.getJudgesToRegister = getJudgesToRegister;
module.exports.getRefereeProfileById = getRefereeProfileById;
module.exports.updateRefereeProfile = updateRefereeProfile;
