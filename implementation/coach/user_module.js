const common = require("../common/user_module");
const sysfunc=require("../commonFunc")


function checkDataBeforeRegistar(userToRegsiter) {
    var isPassed =true
    var errorUsers =new Object()
    var res=[];
    userToRegsiter.forEach(function (user) {
            var tmpErr=checkUser(user)
            user[5] =sysfunc.setBirtdateFormat(user[5])
        if (tmpErr.length!=0)
            isPassed=false;
        errorUsers[user[0]]=tmpErr
    })
    res.isPassed =isPassed;
    res.err =errorUsers;
    return res;
}

function checkUser(user) {
    var err= [];
    //id user
    if(!validator.isInt(user[0].toString(),{gt: 100000000, lt: 1000000000}))
        err.push(Constants.errorMsg.idSportmanErr)
    //firstname
    if(!validator.matches(user[1].toString(),Constants.hebRegex))
        err.push(Constants.errorMsg.firstNameHeb)
    //lastname
    if(!validator.matches(user[2].toString(),Constants.hebRegex))
        err.push(Constants.errorMsg.lastNameHeb)
    //phone
    if(!validator.isInt(user[3].toString())&&user[3].toString().length==10)
        err.push(Constants.errorMsg.phoneErr)
    //email
    if(!validator.isEmail(user[6].toString()))
        err.push(Constants.errorMsg.emailErr)
    //sportClub
    if(!validator.isInt(user[7].toString()))
        err.push(Constants.errorMsg.sportClubErr)
    //sex
    if(!(user[8].toString() in Constants.sexEnum))
        err.push(Constants.errorMsg.sexErr)
    //branch
    if(!(user[9].toString() in Constants.sportType))
        err.push(Constants.errorMsg.sportTypeErr)
        //id coach
    if(!validator.isInt(user[10].toString(),{gt: 100000000, lt: 1000000000}))
        err.push(Constants.errorMsg.idCoachErr)
    /*if(err.length==0){
        if(checkSportsmanExistsDB(user[0]))
            err.push(Constants.errorMsg.idExists)
        if(!checkCoachExistsDB(user[10]))
            err.push(Constants.errorMsg.idCoachNotExists)
    }

     */
    return err;


}
function registerSportman(req, res) {
    var ans=checkDataBeforeRegistar(sysfunc.getArrayFromJson(req.body))
    if(!ans.isPassed)
        res.send(ans.err)

    /*
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

     */
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
    var subject= 'רישום משתמש חדש wuhsu'
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
    await sysfunc.sendEmail(req.body.email,textMsg,subject)
}
module.exports._registerSportman = registerSportman;