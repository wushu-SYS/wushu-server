const common_func = require("../commonFunc")
const userValidation = require("../services/userValidations/userValidationService")
const constants = require("../../constants")

async function sendMail(sportsmanDetails) {
    if (sportsmanDetails[constants.sportsmanUpdateArrayVal.email]) {
        var subject = 'עדכון פרטי משתמש'
        var textMsg = "שלום " + sportsmanDetails[constants.sportsmanUpdateArrayVal.firstName] + "\n" +
            "לבקשתך עודכנו הפרטים האישים שלך במערכת" + "\n" +
            "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
            + "שם פרטי: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.firstName] + "\n"
            + "שם משפחה: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.lastName] + "\n"
            + "כתובת מגורים: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.address] + "\n"
            + "פאלפון: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.phone] + "\n"
            + "תאריך לידה: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.birthDate] + "\n"
            + "תעודת זהות: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.idSportsman] + "\n"
            + "בברכה, מערכת או-שו"
        await common_func.sendEmail(sportsmanDetails[constants.sportsmanUpdateArrayVal.email], subject, textMsg)
    }
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

async function updateSportsmanCoach(idCoach, idSportsman) {
    console.log(idCoach)
    console.log(idSportsman)
    let ans = new Object()
    await dbUtils.sql(`update sportsman_coach set idCoach = @idCoach where idSportman = @idSportsman `)
        .parameter('idSportsman', tediousTYPES.Int, idSportsman)
        .parameter('idCoach', tediousTYPES.Int, idCoach)
        .execute()
        .then(result => {
            ans.results = constants.msg.updateUserDetails;
            ans.status = constants.statusCode.ok;
        })
        .fail((err) => {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans
}

async function checkIdCoachRelatedSportsman(idCoach, idSportsman) {
    await dbUtils.sql('select idCoach from sportsman_coach where idSportsman = @idSportsman ')
        .parameter('idSportsman', tediousTYPES.Int, idSportsman)
        .execute()
        .then(result => {
            return idCoach == result[0]
        })
        .fail((error) => {
            return false;
        });

}

async function updateProfile(data, access, id, profile) {
    let ans = new Object();
    if (await canUpdateProfile(access, id)) {
        let user = combineData(data, profile)
        let ans = userValidation.validateUserDetails(user, "sportsman");
        if (ans.canUpdate) {
            ans = await updateSportsmanProfile(common_func.getArrayFromJson(ans.data));
            return ans
        }
    }
    ans =[]
    ans[0] = new Object()
    ans[0].status = constants.statusCode.badRequest
    return ans
}

async function canUpdateProfile(access, id) {
    let canEditSportsmanProfile;
    if (access === constants.userType.COACH) {
        canEditSportsmanProfile = await checkIdCoachRelatedSportsman(id, user.id)
    } else if (access === constants.userType.MANAGER || id === user.id) {
        canEditSportsmanProfile = true;
    }
    return canEditSportsmanProfile
}

function combineData(data, profile) {
    let user = {
        id: data.id ? data.id : profile.id,
        firstName: data.firstName ? data.firstName : profile.firstname,
        lastName: data.lastName ? data.lastName : profile.lastname,
        phone: data.phone ? data.phone : profile.phone,
        email: data.email ? data.email : profile.email,
        birthDate: data.birthDate ? data.birthDate : (new Date(profile.birthdate)).toLocaleDateString(),
        address: data.address ? data.address : profile.address,
        sex: data.sex ? data.sex : profile.sex,
        oldId: data.oldId ? data.oldId : profile.id,
        sportStyle: data.sportStyle ? data.sportStyle : profile.sportStyle,
    }
    return user

}

module.exports.updateSportsmanProfile = updateSportsmanProfile;
module.exports.checkIdCoachRelatedSportsman = checkIdCoachRelatedSportsman;
module.exports.updateSportsmanCoach = updateSportsmanCoach;
module.exports.updateProfile = updateProfile;
