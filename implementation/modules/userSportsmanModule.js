const constants = require('../../constants')
const common_func = require('../commonFunc')
const {dbConnection} = require("../../dbUtils");

async function insertSportsmanDB(trans, users, sportsmanDetails, i) {
    return trans.query({
        sql: ` INSERT INTO user_Sportsman (id, firstname, lastname, phone, email, birthdate, address, sportclub, sex,photo)
                                    VALUES (:idSportsman, :firstName, :lastName, :phone, :email, :birthDate, :address, :sportClub, :sex ,:photo)`,
        params: {
            idSportsman: sportsmanDetails[constants.colRegisterSportsmanExcel.idSportsman],
            firstName: sportsmanDetails[constants.colRegisterSportsmanExcel.firstName],
            lastName: sportsmanDetails[constants.colRegisterSportsmanExcel.lastName],
            phone: sportsmanDetails[constants.colRegisterSportsmanExcel.phone] ? sportsmanDetails[constants.colRegisterSportsmanExcel.phone] : "",
            address: sportsmanDetails[constants.colRegisterSportsmanExcel.address] ? sportsmanDetails[constants.colRegisterSportsmanExcel.address] : "",
            birthDate: sportsmanDetails[constants.colRegisterSportsmanExcel.birthDate],
            email: sportsmanDetails[constants.colRegisterSportsmanExcel.email] ? sportsmanDetails[constants.colRegisterSportsmanExcel.email] : "",
            sportClub: sportsmanDetails[constants.colRegisterSportsmanExcel.sportClub],
            sex: sportsmanDetails[constants.colRegisterSportsmanExcel.sex],
            photo: constants.defaultProfilePic,
        }
    })
        .then(async function () {
            if (i + 1 < users.length)
                await insertSportsmanDB(trans, users, users[i + 1], i + 1);
        })

}

async function sportsmanProfile(id) {
    let ans = new Object();
    await dbConnection.query({
        sql: `Select user_Sportsman.id, user_Sportsman.firstname as firstname, user_Sportsman.lastname as lastname, user_Sportsman.photo, user_Sportsman.phone, user_Sportsman.email, user_Sportsman.phone, user_Sportsman.birthdate, user_Sportsman.address, sex,user_Coach.id as coachId ,user_Coach.firstname as cfirstname, user_Coach.lastname clastname, name as club,user_Sportsman.sportclub as clubId, taullo, sanda,sportman_files.medicalscan as medicalScan,sportman_files.insurance as insurance
                                    from user_Sportsman
                                    join sportsman_sportStyle on user_Sportsman.id = sportsman_sportStyle.id
                                    join sportsman_coach on user_Sportsman.id = sportsman_coach.idSportman
                                    join user_Coach on sportsman_coach.idCoach = user_Coach.id
                                    join sportclub on user_Sportsman.sportclub = sportclub.id
                                    left join sportman_files on sportman_files.id = :id
                                    where user_Sportsman.id = :id`,
        params: {id: id}
    })
        .then(function (results) {
            results = results.results
            results[0].sportStyle = common_func.convertToSportStyle(results[0].taullo, results[0].sanda);
            ans.status = constants.statusCode.ok;
            ans.results = results[0]
        }).catch(function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

async function deleteSportsman(sportsmanId) {
    let ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    await trans.query({
        sql: `DELETE FROM user_UserTypes WHERE id = :sportsmanId and usertype = :type;`,
        params: {sportsmanId: sportsmanId, type: constants.userType.SPORTSMAN}
    })
        .then(async () => {
            await trans.query({
                sql: `DELETE FROM user_Sportsman WHERE id = :sportsmanId;`,
                params: {
                    sportsmanId: sportsmanId
                }
            }).then(async () => {
                //TODO: delete sportsman directory on drive - job name deleteSportsmanFilesFromGoogleDrive
                ans.status = constants.statusCode.ok;
                ans.results = constants.msg.userDeleted;
                await trans.commit();
            })
        })
        .catch((err) => {
            console.log(err)
            trans.rollback()
        })

    return ans;
}

async function updateSportsmanProfile(sportsManDetails) {
    let ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    await trans.query({
        sql: `UPDATE user_Sportsman SET id = ifnull(:idSportsman, id),
                                                              firstname = ifnull(:firstName, firstname),
                                                              lastname  = ifnull(:lastName, lastname),
                                                              phone     = ifnull(:phone, phone),
                                                              email     = ifnull(:email, email),
                                                              birthdate = ifnull(:birthDate, birthdate),
                                                              address   = ifnull(:address, address),
                                                              sex       = ifnull(:sex, sex)
                                                                                            where id = :oldId;`,
        params: {
            idSportsman: sportsManDetails[constants.sportsmanUpdateArrayVal.idSportsman],
            firstName: sportsManDetails[constants.sportsmanUpdateArrayVal.firstName],
            lastName: sportsManDetails[constants.sportsmanUpdateArrayVal.lastName],
            phone: sportsManDetails[constants.sportsmanUpdateArrayVal.phone],
            address: sportsManDetails[constants.sportsmanUpdateArrayVal.address],
            birthDate: sportsManDetails[constants.sportsmanUpdateArrayVal.birthDate],
            email: sportsManDetails[constants.sportsmanUpdateArrayVal.email],
            sportClub: sportsManDetails[constants.sportsmanUpdateArrayVal.sportClub],
            sex: sportsManDetails[constants.sportsmanUpdateArrayVal.sex],
            oldId: sportsManDetails[constants.sportsmanUpdateArrayVal.oldId]

        }
    }).then(async function () {
        let newId = sportsManDetails[constants.sportsmanUpdateArrayVal.idSportsman];
        let oldId = sportsManDetails[constants.sportsmanUpdateArrayVal.oldId];
        if (newId != oldId) {
            await trans.query({
                sql: `UPDATE user_Passwords SET id = :sportsmanId WHERE id = :oldId;`,
                params: {sportsmanId: newId, oldId: oldId}
            })
        }
    }).then(async function (t) {
        sportsManDetails.push(common_func.setIsTaullo(sportsManDetails[constants.sportsmanUpdateArrayVal.sportStyle]))
        sportsManDetails.push(common_func.setIsSanda(sportsManDetails[constants.sportsmanUpdateArrayVal.sportStyle]))
        await trans.query({
            sql: `UPDATE sportsman_sportStyle SET taullo = :isTaullo , sanda = :isSanda where id = :id;`,
            params: {
                isTaullo: sportsManDetails[constants.sportsmanUpdateArrayVal.isTaullo],
                isSanda: sportsManDetails[constants.sportsmanUpdateArrayVal.isSanda],
                id: sportsManDetails[constants.sportsmanUpdateArrayVal.idSportsman]
            }
        })
    }).then(function (results) {
        //sendMail(sportsManDetails)
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.updateUserDetails;
        // trans.commitTransaction();
    }).catch(function (err) {
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
