const constants = require('../../constants')

async function insertNewCoachDB(trans, users, coachDetails, i) {
    return trans.sql(` INSERT INTO user_Coach (id, firstname, lastname, phone, email, birthdate, address, sportclub,photo)
                                    VALUES (@idCoach, @firstName, @lastName, @phone, @email, @birthDate, @address, @sportClub ,@photo)`)
        .parameter('idCoach', tediousTYPES.Int, coachDetails[constants.colRegisterCoachExcel.idCoach])
        .parameter('firstName', tediousTYPES.NVarChar, coachDetails[constants.colRegisterCoachExcel.firstName])
        .parameter('lastName', tediousTYPES.NVarChar, coachDetails[constants.colRegisterCoachExcel.lastName])
        .parameter('phone', tediousTYPES.NVarChar, coachDetails[constants.colRegisterCoachExcel.phone])
        .parameter('address', tediousTYPES.NVarChar, coachDetails[constants.colRegisterCoachExcel.address])
        .parameter('birthDate', tediousTYPES.NVarChar, coachDetails[constants.colRegisterCoachExcel.birthDate])
        .parameter('email', tediousTYPES.NVarChar, coachDetails[constants.colRegisterCoachExcel.email])
        .parameter('sportClub', tediousTYPES.Int, coachDetails[constants.colRegisterCoachExcel.sportClub])
        .parameter('photo', tediousTYPES.NVarChar, constants.defaultProfilePic)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertNewCoachDB(trans, users, users[i + 1], i + 1)
            return testResult
        })

}

async function getClubCoaches(clubId) {
    let ans = new Object();
    await dbUtils.sql(`select * from user_Coach where sportclub = @clubId `)
        .parameter('clubId', tediousTYPES.Int, clubId)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

async function getCoaches() {
    let ans = new Object();
    await dbUtils.sql(`Select * from user_Coach`)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

async function getCoachesNotRegisterAsJudges() {
    let ans = new Object();
    await dbUtils.sql(`select * from user_Coach except (select user_Coach.* from user_Coach join user_Judge on user_Coach.id = user_Judge.id) `)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
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
            ans.status = constants.statusCode.ok;
            ans.results = results[0]
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}


/**
 * handle deleting coach from the system
 * @param coach - to delete
 * @return {status, results}
 */
async function deleteCoach(coach) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`DELETE FROM user_UserTypes WHERE id = @id and usertype = @type;`)
                .parameter('id', tediousTYPES.Int, coach)
                .parameter('type', tediousTYPES.Int, constants.userType.COACH)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM user_Coach WHERE id = @id;`)
                .parameter('id', tediousTYPES.Int, coach)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.userDeleted;
            await trans.commitTransaction();
        })
        .fail(async function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            await trans.rollbackTransaction();
        })
    return ans;
}

/**
 * updating the details of coach entity
 * @param coachDetails
 * @return {status, results} - result contains successful message or errors
 */
async function updateCoachProfile(coachDetails) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`UPDATE user_Coach SET id = ISNULL(@idCoach, id),
                                                            firstname = ISNULL(@firstName, firstname),
                                                            lastname  = ISNULL(@lastName, lastname),
                                                            phone     = ISNULL(@phone, phone),
                                                            email     = ISNULL(@email, email),
                                                            birthdate = ISNULL(@birthDate, birthdate),
                                                            address   = ISNULL(@address, address)
                                                                            where id = @oldId;`)
                .parameter('idCoach', tediousTYPES.Int, coachDetails[0])
                .parameter('firstName', tediousTYPES.NVarChar, coachDetails[1])
                .parameter('lastName', tediousTYPES.NVarChar, coachDetails[2])
                .parameter('phone', tediousTYPES.NVarChar, coachDetails[3])
                .parameter('email', tediousTYPES.NVarChar, coachDetails[4])
                .parameter('birthDate', tediousTYPES.Date, coachDetails[5])
                .parameter('address', tediousTYPES.NVarChar, coachDetails[6])
                .parameter('oldId', tediousTYPES.Int, coachDetails[7])
                .execute()
        })
        .then(async function (testResult) {
            let newId = coachDetails[0];
            let oldId = coachDetails[7];
            if (newId != oldId) {
                return await trans.sql(`UPDATE user_Passwords SET id = @id WHERE id = @oldId;`)
                    .parameter('id', tediousTYPES.Int, newId)
                    .parameter('oldId', tediousTYPES.Int, oldId)
                    .returnRowCount()
                    .execute();
            }
        })
        .then(function (results) {
            //sendUpdateEmail(coachDetails)
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.updateUserDetails;
            //trans.commitTransaction();
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
            //trans.rollbackTransaction();
        });
    return [ans, trans];
}

module.exports.insertNewCoachDB = insertNewCoachDB
module.exports.getClubCoaches = getClubCoaches
module.exports.getCoaches = getCoaches
module.exports.getCoachesNotRegisterAsJudges = getCoachesNotRegisterAsJudges
module.exports.getCoachProfileById = getCoachProfileById
module.exports.deleteCoach = deleteCoach
module.exports.updateCoachProfile = updateCoachProfile
