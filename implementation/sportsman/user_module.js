const common_func = require("../commonFunc")
const userValidation = require("../services/userValidations/userValidationService")
const constants =require("../../constants")

async function sendMail(sportsmanDetails) {
    if(sportsmanDetails[constants.sportsmanUpdateArrayVal.email]) {
        var subject = 'עדכון פרטי משתמש'
        var textMsg = "שלום " +sportsmanDetails[constants.sportsmanUpdateArrayVal.firstName] + "\n" +
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
            return await trans.sql(`UPDATE user_Sportsman SET id = @idSportsman, firstname = @firstName, lastname = @lastName, phone = @phone, email = @email, birthdate = @birthDate,
                      address = @address, sex = @sex where id =@oldId;`)
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
            trans.commitTransaction();
        }).fail(function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        });
    return ans;
}

async function checkIdCoachRelatedSportsman(idCoach,idSportsman) {
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


module.exports.updateSportsmanProfile = updateSportsmanProfile;
module.exports.checkIdCoachRelatedSportsman=checkIdCoachRelatedSportsman;
