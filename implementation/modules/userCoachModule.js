const constants = require('../../constants')
const common_func = require('../commonFunc')
const {dbConnection} = require("../../dbUtils");
//const bcrypt = require('bcryptjs');

async function insertNewCoachDB(trans, users, coachDetails, i) {
    return trans.query({
        sql: ` INSERT INTO user_Coach (id, firstname, lastname, phone, email, birthdate, address, sportclub,photo,comment)
                                    VALUES (:idCoach, :firstName, :lastName, :phone, :email, :birthDate, :address, :sportClub ,:photo,:comment)`,
        params: {
            idCoach: coachDetails[constants.colRegisterCoachExcel.idCoach],
            firstName: coachDetails[constants.colRegisterCoachExcel.firstName],
            lastName: coachDetails[constants.colRegisterCoachExcel.lastName],
            phone: coachDetails[constants.colRegisterCoachExcel.phone],
            address: coachDetails[constants.colRegisterCoachExcel.address],
            birthDate: coachDetails[constants.colRegisterCoachExcel.birthDate],
            email: coachDetails[constants.colRegisterCoachExcel.email],
            sportClub: coachDetails[constants.colRegisterCoachExcel.sportClub],
            comment: coachDetails[constants.colRegisterCoachExcel.comment],
            photo: constants.defaultProfilePic
        }
    }).then(async function () {
        if (i + 1 < users.length)
            await insertNewCoachDB(trans, users, users[i + 1], i + 1)
    })

}
async function insertLinks(trans, users, coachDetails, i) {
    return trans.query({
        sql: ` INSERT INTO links (id, facebook, instagram, anotherLink)
                                    VALUES (:id, :facebook, :instagram, :anotherLink)`,
        params: {
            id: coachDetails[constants.colRegisterCoachExcel.idCoach],
            facebook : coachDetails[constants.colRegisterCoachExcel.facebook],
            instagram : coachDetails[constants.colRegisterCoachExcel.instagram],
            anotherLink : coachDetails[constants.colRegisterCoachExcel.anotherLink],
        }
    }).then(async function () {
        if (i + 1 < users.length)
            await insertLinks(trans, users, users[i + 1], i + 1)
    })

}


async function getClubCoaches(clubId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `select * from user_Coach where sportclub = :clubId `,
        params: {
            clubId: clubId
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
    });
    return ans;
}

async function getCoaches() {
    let ans = new Object();
    await dbConnection.query({
        sql: `Select * from user_Coach`
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
    });
    return ans;
}

async function getCoachesNotRegisterAsJudges() {
    let ans = new Object();
    await dbConnection.query({
        sql: `select * from user_Coach where id not in (select user_Coach.id from user_Coach join user_Judge on user_Coach.id = user_Judge.id) `
    })
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results.results
        }).catch(function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

async function getCoachProfileById(id) {
    let ans = new Object();
    await dbConnection.query({
        sql: `Select user_Coach.*,facebook,instagram,anotherLink from user_Coach left join links on user_coach.id=links.id Where user_Coach.id= :idCoach`,
        params: {
            idCoach: id
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results[0]
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
    });
    return ans;
}


/**
 * handle deleting coach from the system
 * :param coach - to delete
 * :return {status, results}
 */
async function deleteCoach(coach) {
    let ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    await trans.query({
        sql: `DELETE FROM user_UserTypes WHERE id = :id and usertype = :type;`,
        params: {
            id: coach,
            type: constants.userType.COACH
        }
    }).then(async function () {
        await trans.query({
            sql: `DELETE FROM user_Coach WHERE id = :id;`,
            params: {
                id: coach
            }
        })
    }).then(async function(){
        await trans.query({
            sql : `DELETE FROM links WHERE id = :id;`,
            params:{
                id : coach
            }
        })
    }).then(async function () {
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

/**
 * updating the details of coach entity
 * :param coachDetails
 * :return {status, results} - result contains successful message or errors
 */
async function updateCoachProfile(coachDetails) {
    let ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    await trans.query({
        sql: `UPDATE user_Coach SET id = ifnull(:idCoach, id),
                                                            firstname = ifnull(:firstName, firstname),
                                                            lastname  = ifnull(:lastName, lastname),
                                                            phone     = ifnull(:phone, phone),
                                                            email     = ifnull(:email, email),
                                                            birthdate = ifnull(:birthDate, birthdate),
                                                            address   = ifnull(:address, address),
                                                            comment = ifnull(:comment,comment)
                                                                            where id = :oldId;`,
        params: {
            idCoach: coachDetails[0],
            firstName: coachDetails[1],
            lastName: coachDetails[2],
            phone: coachDetails[3],
            email: coachDetails[4],
            birthDate: coachDetails[5],
            address: coachDetails[6],
            comment: coachDetails[7],
            oldId: coachDetails[8],

        }
    }).then(async function () {
        let newId = coachDetails[0];
        let oldId = coachDetails[8];
        if (newId != oldId) {
            await trans.query({
                sql: `UPDATE user_Passwords SET id = :id WHERE id = :oldId;`,
                params: {
                    id: newId,
                    oldId: oldId
                }
            })
        }
    }).then(function () {
        //sendUpdateEmail(coachDetails)
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.updateUserDetails;
        //trans.commitTransaction();
    }).catch(function (err) {
        console.log(err)
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
module.exports.insertLinks = insertLinks
