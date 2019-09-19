const common = require("../common/user_module");

function registerSportman(req, res) {
    let validator = new validation(req.body, {
        id: 'required|integer|minLength:9|maxLength:9',
        firstname: 'required|lengthBetween:2,10',
        lastname: 'required|lengthBetween:2,10',
        phone: 'required|minLength:10|maxLength:10|integer',
        address: 'required',
        email: 'required|email',
        sportclub: 'required',
        idCoach: 'required',
        birthdate: 'required',
        sex: 'required',
        sportStyle: 'required'
    });
    var regex = new RegExp("^[\u0590-\u05fe]+$");
    var initial = req.body.birthdate.split("/");
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(400).send(validator.errors);
        } else if (!regex.test(req.body.firstname)) {
            res.status(400).send("First name must be in hebrew");
        } else if (!regex.test(req.body.lastname)) {
            res.status(400).send("Last name must be in hebrew");
        } else if (initial.length != 3) {
            res.status(400).send("The birthdate must be a valid date");
        } else if (req.body.sex != "זכר" && req.body.sex != "נקבה") {
            res.status(400).send("The sex field is not valid");
        } else {
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
                                    DButilsAzure.execQuery(`select id from user_Coach where id = '${req.body.idCoach}'`)
                                        .then((result) => {
                                            if (result.length === 0)
                                                res.status(400).send("coach dosn't exists");
                                            else {
                                                DButilsAzure.execQuery(` INSERT INTO user_Sportsman (id, firstname, lastname, phone, email, birthdate, address, sportclub, sex)
                                                        VALUES ('${(req.body.id)}','${(req.body.firstname)}','${req.body.lastname}','${req.body.phone}','${req.body.email}','${req.body.birthdate}','${req.body.address}','${req.body.sportclub}','${req.body.sex}')`)
                                                    .then(async () => {
                                                        //await insertSportsmanCategory(req);
                                                        await common._insertPassword(req, userType.SPORTSMAN, 1);
                                                        await insertCoach(req);
                                                        //await sendEmail(req);
                                                        res.status(200).send("Registration completed successfully")
                                                    })
                                                    .catch((error) => {
                                                        res.status(400).send("1" + error)
                                                    })
                                            }
                                        })
                                        .catch((error) => {
                                            res.status(400).send("2" + error)
                                        })
                                }
                            })
                            .catch((error) => {
                                res.status(400).send("3" + error)
                            })
                    }
                })
                .catch((error) => {
                    res.status(400).send("4" + error)
                })
        }
    });
}
/*
async function insertSportsmanCategory(req) {
    console.log("insert sportsman Category");
    DButilsAzure.execQuery(`INSERT INTO sportsman_category (id,sportStyle)
                    Values ('${req.body.id}','${req.body.sportStyle}')`)
        .catch((error) => {
            res.status(400).send(error)
        })
}

 */
async function insertCoach(req) {
    console.log("insert coach");
    DButilsAzure.execQuery(`INSERT INTO sportsman_coach (idSportman,idCoach)
                    Values ('${req.body.id}','${req.body.idCoach}')`)
        .catch((error) => {
            res.status(400).send(error)
        })
}
async function sendEmail(req) {
    const send = require('gmail-send')({
        user: 'wushuSys@gmail.com',
        pass: 'ktrxyruavpyiqfav',
        to:   req.body.email,
        subject: 'רישום משתמש חדש wuhsu',
    });
    var textMsg = "שלום "+req.body.firstname+"\n"+
        "הינך רשום למערכת של התאחדות האו-שו"+"\n"+
             "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי"+"\n"
    +"שם פרטי: "+req.body.firstname+"\n"
    +"שם משפחה: "+req.body.lastname+"\n"
    +"כתובת מגורים: "+req.body.address+"\n"
    +"פאלפון: "+req.body.phone+"\n"
    +"תאריך לידהי: "+req.body.birthdate+"\n"
    +"תעודת זהות: "+req.body.id+"\n"
    +" שם המשתמש והסיסמא הראשונית שלך הינם תעודת הזהות שלך"+"\n\n\n"
    +"בברכה, " +"\n"+
        "מערכת או-שו"
    send({
        text:  textMsg,
    }, (error, result, fullResult) => {
        if (error) console.error(error);
        console.log(result);
    })

}

module.exports._registerSportman = registerSportman;