const constants = require('../../constants')
const common_func =require('../commonFunc')
async function insertSportsmanDB(trans, users, sportsmanDetails, i) {
    return trans.sql(` INSERT INTO user_Sportsman (id, firstname, lastname, phone, email, birthdate, address, sportclub, sex,photo)
                                    VALUES (@idSportsman, @firstName, @lastName, @phone, @email, @birthDate, @address, @sportClub, @sex ,@photo)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.idSportsman])
        .parameter('firstName', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.firstName])
        .parameter('lastName', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.lastName])
        .parameter('phone', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.phone])
        .parameter('address', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.address])
        .parameter('birthDate', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.birthDate])
        .parameter('email', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.email])
        .parameter('sportClub', tediousTYPES.Int, sportsmanDetails[constants.colRegisterSportsmanExcel.sportClub])
        .parameter('sex', tediousTYPES.NVarChar, sportsmanDetails[constants.colRegisterSportsmanExcel.sex])
        .parameter('photo', tediousTYPES.NVarChar, constants.defaultProfilePic)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertSportsmanDB(trans, users, users[i + 1], i + 1);
            return testResult
        })

}

async function sportsmanProfile(id) {
    let ans = new Object();
    await dbUtils.sql(`Select user_Sportsman.id, user_Sportsman.firstname as firstname, user_Sportsman.lastname as lastname, user_Sportsman.photo, user_Sportsman.phone, user_Sportsman.email, user_Sportsman.phone, user_Sportsman.birthdate, user_Sportsman.address, sex,user_Coach.id as coachId ,user_Coach.firstname as cfirstname, user_Coach.lastname clastname, name as club,user_Sportsman.sportclub as clubId, taullo, sanda,sportman_files.medicalscan as medicalScan,sportman_files.insurance as insurance
                                    from user_Sportsman
                                    join sportsman_sportStyle on user_Sportsman.id = sportsman_sportStyle.id
                                    join sportsman_coach on user_Sportsman.id = sportsman_coach.idSportman
                                    join user_Coach on sportsman_coach.idCoach = user_Coach.id
                                    join sportclub on user_Sportsman.sportclub = sportclub.id
                                    left join sportman_files on sportman_files.id = @id
                                    where user_Sportsman.id = @id`)
        .parameter('id', tediousTYPES.Int, id)
        .execute()
        .then(function (results) {
            results[0].sportStyle = common_func.convertToSportStyle(results[0].taullo, results[0].sanda);
            ans.status = constants.statusCode.ok;
            ans.results = results[0]
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}
async function deleteSportsman(sportsmanId) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`DELETE FROM user_UserTypes WHERE id = @sportsmanId and usertype = @type;`)
                .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
                .parameter('type', tediousTYPES.Int, constants.userType.SPORTSMAN)
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

async function updateSportsmanProfile(sportsManDetails) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`UPDATE user_Sportsman SET id = ISNULL(@idSportsman, id),
                                                              firstname = ISNULL(@firstName, firstname),
                                                              lastname  = ISNULL(@lastName, lastname),
                                                              phone     = ISNULL(@phone, phone),
                                                              email     = ISNULL(@email, email),
                                                              birthdate = ISNULL(@birthDate, birthdate),
                                                              address   = ISNULL(@address, address),
                                                              sex       = ISNULL(@sex, sex)
                                                                                            where id = @oldId;`)
                .parameter('idSportsman', tediousTYPES.Int, sportsManDetails[constants.sportsmanUpdateArrayVal.idSportsman])
                .parameter('firstName', tediousTYPES.NVarChar, sportsManDetails[constants.sportsmanUpdateArrayVal.firstName])
                .parameter('lastName', tediousTYPES.NVarChar, sportsManDetails[constants.sportsmanUpdateArrayVal.lastName])
                .parameter('phone', tediousTYPES.NVarChar, sportsManDetails[constants.sportsmanUpdateArrayVal.phone])
                .parameter('email', tediousTYPES.NVarChar, sportsManDetails[constants.sportsmanUpdateArrayVal.email])
                .parameter('birthDate', tediousTYPES.Date, sportsManDetails[constants.sportsmanUpdateArrayVal.birthDate])
                .parameter('address', tediousTYPES.NVarChar, sportsManDetails[constants.sportsmanUpdateArrayVal.address])
                .parameter('sex', tediousTYPES.NVarChar, sportsManDetails[constants.sportsmanUpdateArrayVal.sex])
                .parameter('oldId', tediousTYPES.Int, sportsManDetails[constants.sportsmanUpdateArrayVal.oldId])
                .execute()
        })
        .then(async function (testResult) {
            let newId = sportsManDetails[constants.sportsmanUpdateArrayVal.idSportsman];
            let oldId = sportsManDetails[constants.sportsmanUpdateArrayVal.oldId];
            if (newId != oldId) {
                return await trans.sql(`UPDATE user_Passwords SET id = @sportsmanId WHERE id = @oldId;`)
                    .parameter('sportsmanId', tediousTYPES.Int, newId)
                    .parameter('oldId', tediousTYPES.Int, oldId)
                    .returnRowCount()
                    .execute();
            }
        })
        .then(async function (t) {
            sportsManDetails.push(common_func.setIsTaullo(sportsManDetails[constants.sportsmanUpdateArrayVal.sportStyle]))
            sportsManDetails.push(common_func.setIsSanda(sportsManDetails[constants.sportsmanUpdateArrayVal.sportStyle]))
            return await trans.sql(`UPDATE sportsman_sportStyle SET taullo = @isTaullo , sanda = @isSanda where id = @id;`)
                .parameter('isTaullo', tediousTYPES.Bit, sportsManDetails[constants.sportsmanUpdateArrayVal.isTaullo])
                .parameter('isSanda', tediousTYPES.Bit, sportsManDetails[constants.sportsmanUpdateArrayVal.isSanda])
                .parameter('id', tediousTYPES.Int, sportsManDetails[constants.sportsmanUpdateArrayVal.idSportsman])
                .returnRowCount()
                .execute();

        })
        .then(function (results) {
            //sendMail(sportsManDetails)
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.updateUserDetails;
            // trans.commitTransaction();
        }).fail(function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            // trans.rollbackTransaction();
        });
    return [ans, trans];
}

module.exports.insertSportsmanDB = insertSportsmanDB
module.exports.sportsmanProfile = sportsmanProfile
module.exports.deleteSportsman = deleteSportsman
module.exports.updateSportsmanProfile = updateSportsmanProfile