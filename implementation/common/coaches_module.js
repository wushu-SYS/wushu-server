async function getCoaches() {
    let ans = new Object();
    await dbUtils.sql(`Select id, firstname, lastname, sportclub, photo from user_Coach`)
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

async function getCoachProfileById(id) {
    let ans = new Object();
    await dbUtils.sql(`Select * from user_Coach Where id= @idCoach`)
        .parameter('idCoach', tediousTYPES.Int, id)
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

async function updateCoachProfile(coachDetails) {
    let ans = new Object();
    await dbUtils.sql(`UPDATE user_Coach SET id =@idCoach, firstname = @firstName, lastname = @lastName, phone = @phone, email = @email, birthdate = @birthDate,
                      address = @address where id =@oldId;`)
        .parameter('idCoach', tediousTYPES.Int, coachDetails[0])
        .parameter('firstName', tediousTYPES.NVarChar, coachDetails[1])
        .parameter('lastName', tediousTYPES.NVarChar, coachDetails[2])
        .parameter('phone', tediousTYPES.NVarChar, coachDetails[3])
        .parameter('email', tediousTYPES.NVarChar, coachDetails[4])
        .parameter('birthDate', tediousTYPES.Date, coachDetails[5])
        .parameter('address', tediousTYPES.NVarChar, coachDetails[6])
        .parameter('oldId', tediousTYPES.Int, coachDetails[7])
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


module.exports.getCoaches = getCoaches;
module.exports.getCoachProfileById=getCoachProfileById;
module.exports.updateCoachProfile = updateCoachProfile;