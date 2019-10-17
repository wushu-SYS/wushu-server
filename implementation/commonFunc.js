function getArrayFromJson(data) {
    var res =[];
    data.forEach(function (row){
        var tmp =[]
        for (var key in row) {
            tmp.push(row[key])
        }
        res.push(tmp)
    })
    return res;
}

async function sendMail(sendTo,message,sub) {
    const send = require('gmail-send')({
        user: 'wushuSys@gmail.com',
        pass: 'ktrxyruavpyiqfav',
        to:   sendTo ,// req.body.email,
        subject:sub // 'עדכון פרטי משתמש',
    });
        var textMsg = message
    /*
    "שלום "+req.body.firstname+"\n"+
            "לבקשתך עודכנו הפרטים האישים שלך במערכת"+"\n"+
            "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי"+"\n"
            +"שם פרטי: "+req.body.firstname+"\n"
            +"שם משפחה: "+req.body.lastname+"\n"
            +"כתובת מגורים: "+req.body.address+"\n"
            +"פאלפון: "+req.body.phone+"\n"
            +"תאריך לידה: "+req.body.birthdate+"\n"
            +"תעודת זהות: "+req.body.id+"\n"
            +"בברכה, מערכת או-שו"

     */
    send({
        text:  textMsg,
    }, (error, result, fullResult) => {
        if (error) console.error(error);
        console.log(result);
    })

}
module.exports.getArrayFromJson = getArrayFromJson;
module.exports.sendEmail =sendMail;