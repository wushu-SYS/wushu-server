const constants = require('../../constants')
const common_func = require('../commonFunc')
const userJudgeModule =require('../modules/userJudgeModule')

async function sendNewUserEmail(users) {
    var subject = 'רישום משתמש חדש wuhsu'
    users.forEach((user) => {
        if (user[constants.colRegisterSportsmanExcel.email]) {
            var textMsg = "שלום " + user[constants.colRegisterSportsmanExcel.firstName] + "\n" +
                "הינך רשום למערכת של התאחדות האו-שו" + "\n" +
                "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
                + "שם פרטי: " + user[constants.colRegisterSportsmanExcel.firstName] + "\n"
                + "שם משפחה: " + user[constants.colRegisterSportsmanExcel.lastName] + "\n"
                + "כתובת מגורים: " + user[constants.colRegisterSportsmanExcel.address] + "\n"
                + "פאלפון: " + user[constants.colRegisterSportsmanExcel.phone] + "\n"
                + "תאריך לידהי: " + user[constants.colRegisterSportsmanExcel.birthDate] + "\n"
                + "תעודת זהות: " + user[constants.colRegisterSportsmanExcel.idSportsman] + "\n"
                + " שם המשתמש והסיסמא הראשונית שלך הינם תעודת הזהות שלך" + "\n\n\n"
                + "בברכה, " + "\n" +
                "מערכת או-שו"
            // sendEmail(user[constants.colRegisterSportsmanExcel.email], textMsg, subject)
        }
    })
}
async function sendUpdateEmail(coachDetails) {
    if (coachDetails[4]) {
        var subject = 'עדכון פרטי משתמש'
        var textMsg = "שלום " + coachDetails[1] + "\n" +
            "לבקשתך עודכנו הפרטים האישים שלך במערכת" + "\n" +
            "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
            + "שם פרטי: " + coachDetails[1] + "\n"
            + "שם משפחה: " + coachDetails[2] + "\n"
            + "כתובת מגורים: " + coachDetails[6] + "\n"
            + "פאלפון: " + coachDetails[3] + "\n"
            + "תאריך לידה: " + coachDetails[5] + "\n"
            + "תעודת זהות: " + coachDetails[0] + "\n"
            + "בברכה, מערכת או-שו"
       // await common_func.sendEmail(coachDetails[0], subject, textMsg)
    }
}
async function autoReminderForUploadCriminalRecord() {
    let judges = await userJudgeModule.getJudgesForReminder();
    judges.forEach((judge) => {
        console.log(`[Log] - auto reminder for judge id ${judge.id} to upload criminal record by mail`)
        let msg = 'שלום,' + '\n' + 'נא העלה רישום פלילי למערכת' + '\n' + '\n' + 'תודה,' + '\n' + 'מערכת או-שו'
        //  functions_com.sendEmail(judge.email,msg,'מערכת אושו -תזכורת')
    })

}

async function sendJudgeUpdateEmail(user) {
    if (user[4]) {
        var subject = 'עדכון פרטי משתמש'
        var textMsg = "שלום " + user[1] + "\n" +
            "לבקשתך עודכנו הפרטים האישים שלך במערכת" + "\n" +
            "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
            + "שם פרטי: " + user[1] + "\n"
            + "שם משפחה: " + user[2] + "\n"
            + "פאלפון: " + user[3] + "\n"
            + "תעודת זהות: " + user[0] + "\n"
            + "בברכה, מערכת או-שו"
       // await common_func.sendEmail(coachDetails[0], subject, textMsg)
    }
}


//
// async function sendMail(req) {
//     var subject = 'רישום משתמש חדש wuhsu'
//     var textMsg = "שלום" + req.body.firstname + "\n" +
//         "הינך רשום למערכת של התאחדות האו-שו" + "\n"
//     "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
//     + "שם פרטי: " + req.body.firstname + "\n"
//     + "שם משפחה: " + req.body.lastname + "\n"
//     + "כתובת מגורים: " + req.body.address + "\n"
//     + "פאלפון: " + req.body.phone + "\n"
//     + "תאריך לידהי: " + req.body.birthdate + "\n"
//     + "תעודת זהות: " + req.body.id + "\n"
//     + " שם המשתמש והסיסמא הראשונית שלך הינם תעודת הזהות"
//     + "בברכה, מערכת או-שו"
//     common_func.sendEmail(req.body.email, subject, textMsg)
// }
// async function sendMail(sportsmanDetails) {
//     if (sportsmanDetails[constants.sportsmanUpdateArrayVal.email]) {
//         var subject = 'עדכון פרטי משתמש'
//         var textMsg = "שלום " + sportsmanDetails[constants.sportsmanUpdateArrayVal.firstName] + "\n" +
//             "לבקשתך עודכנו הפרטים האישים שלך במערכת" + "\n" +
//             "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
//             + "שם פרטי: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.firstName] + "\n"
//             + "שם משפחה: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.lastName] + "\n"
//             + "כתובת מגורים: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.address] + "\n"
//             + "פאלפון: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.phone] + "\n"
//             + "תאריך לידה: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.birthDate] + "\n"
//             + "תעודת זהות: " + sportsmanDetails[constants.sportsmanUpdateArrayVal.idSportsman] + "\n"
//             + "בברכה, מערכת או-שו"
//         await common_func.sendEmail(sportsmanDetails[constants.sportsmanUpdateArrayVal.email], subject, textMsg)
//     }
// }
/*
async function sendEmail(sendTo, message, sub) {
    const send = require('gmail-send')({
        user: 'wushuSys@gmail.com',
        pass: 'ktrxyruavpyiqfav',
        to: sendTo,
        subject: sub
    });
    await send({
        text: message,
    }, (error, result, fullResult) => {
        if (error) console.error(error);
    })

}

 */


module.exports.sendNewUserEmail = sendNewUserEmail
module.exports.autoReminderForUploadCriminalRecord = autoReminderForUploadCriminalRecord
module.exports.sendUpdateEmail = sendUpdateEmail
module.exports.sendJudgeUpdateEmail = sendJudgeUpdateEmail
