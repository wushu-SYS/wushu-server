const mutual = require("../common/user_module");

function registerCoach(req,res) {
    let validator = new validation(req.body, {
        id: 'required|integer|minLength:9|maxLength:9',
        firstname: 'required|lengthBetween:2,10',
        lastname: 'required|lengthBetween:2,10',
        phone: 'required|minLength:10|maxLength:10|integer',
        address: 'required',
        email: 'required|email',
        sportclub: 'required',
        birthdate: 'required',
        sportStyle: 'required',
        teamname: 'required'
    });
    var regex = new RegExp("^[\u0590-\u05fe]+$");
    var initial = req.body.birthdate.split("/");
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(400).send(validator.errors);
        }
        else if(!regex.test(req.body.firstname)){
            res.status(400).send("First name must be in hebrew");
        }
        else if(!regex.test(req.body.lastname)){
            res.status(400).send("Last name must be in hebrew");
        }
        else if(!regex.test(req.body.teamname)){
            res.status(400).send("team name must be in hebrew");
        }
        else if(initial.length != 3){
            res.status(400).send("The birthdate must be a valid date");
        }
        else {
            DButilsAzure.execQuery(`select id from user_Passwords where id = '${req.body.id}'`)
                .then((result) => {
                    if (result.length > 0) {
                        res.status(403).send("The userName already registered")
                    } else {
                        DButilsAzure.execQuery(`select id from sportclub where id = '${req.body.sportclub}'`)
                            .then((result) => {
                                if (result.length === 0)
                                    res.status(400).send("sportclub dosn't exists");
                                else {
                                    req.body.birthdate = ([initial[1], initial[0], initial[2]].join('/'));
                                    DButilsAzure.execQuery(` INSERT INTO user_Coach (id, firstname, lastname, phone, email, birthdate, address, sportclub)
                                     VALUES ('${(req.body.id)}','${(req.body.firstname)}','${req.body.lastname}','${req.body.phone}','${req.body.email}','${req.body.birthdate}','${req.body.address}','${req.body.sportclub}')`)
                                        .then(async () => {
                                            await sendMail(req)
                                            await insertCoachTeam(req);
                                            await mutual._insertPassword(req, userType.COACH, 1);
                                            res.status(200).send("Registration completed successfully");
                                        })
                                        .catch((error) => {
                                            res.status(400).send(error)
                                        })
                                }
                            })
                            .catch((error) => {
                                res.status(400).send(error)
                            })
                    }
                })
                .catch((error) => {
                    res.status(400).send(error)
                })
        }
    });
}
async function insertCoachTeam(req) {
    console.log("insert coach team");
    DButilsAzure.execQuery(`INSERT INTO coach_team (id,sportStyle,teamname)
                    Values ('${req.body.id}','${req.body.sportStyle}','${req.body.teamname}')`)
        .catch((error) => {
            res.status(400).send(error)
        })
}
async function sendMail(req) {
    const send = require('gmail-send')({
        user: 'wushuSys@gmail.com',
        pass: 'ktrxyruavpyiqfav',
        to:   req.body.email,
        subject: 'רישום משתמש חדש wuhsu',
    });
    var textMsg = "שלום"+req.body.firstname+"\n"+
                    "הינך רשום למערכת של התאחדות האו-שו"+"\n"
                    "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי"+"\n"
                    +"שם פרטי: "+req.body.firstname+"\n"
                    +"שם משפחה: "+req.body.lastname+"\n"
                    +"כתובת מגורים: "+req.body.address+"\n"
                    +"פאלפון: "+req.body.phone+"\n"
                    +"תאריך לידהי: "+req.body.birthdate+"\n"
                    +"תעודת זהות: "+req.body.id+"\n"
                    +" שם המשתמש והסיסמא הראשונית שלך הינם תעודת הזהות"
                    +"בברכה, מערכת או-שו"
    send({
        text:  textMsg,
    }, (error, result, fullResult) => {
        if (error) console.error(error);
        console.log(result);
    })

}

module.exports._registerCoach=registerCoach;



