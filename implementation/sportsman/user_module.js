const common_func = require("../commonFunc")
const userValidation = require("../services/userValidations/userValidationService")


async function sendMail(req) {
    var subject = 'עדכון פרטי משתמש'
    var textMsg = "שלום " + req.body.firstname + "\n" +
        "לבקשתך עודכנו הפרטים האישים שלך במערכת" + "\n" +
        "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
        + "שם פרטי: " + req.body.firstname + "\n"
        + "שם משפחה: " + req.body.lastname + "\n"
        + "כתובת מגורים: " + req.body.address + "\n"
        + "פאלפון: " + req.body.phone + "\n"
        + "תאריך לידה: " + req.body.birthdate + "\n"
        + "תעודת זהות: " + req.body.id + "\n"
        + "בברכה, מערכת או-שו"
    await common_func.sendEmail(req.body.email, subject, textMsg)
}



async function updateSportsmanProfile(sportsManDetails) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`UPDATE user_Sportsman SET id = @idSportsman, firstname = @firstName, lastname = @lastName, phone = @phone, email = @email, birthdate = @birthDate,
                      address = @address, sex = @sex where id =@oldId;`)
                .parameter('idSportsman', tediousTYPES.Int, sportsManDetails[0])
                .parameter('firstName', tediousTYPES.NVarChar, sportsManDetails[1])
                .parameter('lastName', tediousTYPES.NVarChar, sportsManDetails[2])
                .parameter('phone', tediousTYPES.NVarChar, sportsManDetails[3])
                .parameter('email', tediousTYPES.NVarChar, sportsManDetails[4])
                .parameter('birthDate', tediousTYPES.Date, sportsManDetails[5])
                .parameter('address', tediousTYPES.NVarChar, sportsManDetails[6])
                .parameter('sex', tediousTYPES.NVarChar, sportsManDetails[7])
                .parameter('oldId', tediousTYPES.Int, sportsManDetails[8])
                .execute()
        })
        .then(async function (testResult) {
            let newId = sportsManDetails[0];
            let oldId = sportsManDetails[8];
            if (newId != oldId) {
                return await trans.sql(`UPDATE user_Passwords SET id = @sportsmanId WHERE id = @oldId;`)
                    .parameter('sportsmanId', tediousTYPES.Int, newId)
                    .parameter('oldId', tediousTYPES.Int, oldId)
                    .returnRowCount()
                    .execute();
            }
        })
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.updateUserDetails;
            trans.commitTransaction();
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
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
