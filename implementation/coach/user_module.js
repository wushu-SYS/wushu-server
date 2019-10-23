const common = require("../common/user_module");
const sysfunc = require("../commonFunc")


function checkDataBeforeRegister(userToRegsiter) {
    let errorUsers = new Object()
    let res = new Object();
    res.isPassed = true;
    userToRegsiter.forEach(function (user) {
        let tmpErr = checkUser(user)
        user[5] = sysfunc.setBirtdateFormat(user[5])
        if (tmpErr.length != 0) {
            res.isPassed = false;
            errorUsers[user[0]] = tmpErr
        }
    })
    res.err = errorUsers;
    res.users = userToRegsiter;
    return res;
}

function checkUser(user) {
    let err = [];
    //id user
    if (!validator.isInt(user[0].toString(), {gt: 100000000, lt: 1000000000}))
        err.push(Constants.errorMsg.idSportmanErr)
    //firstname
    if (!validator.matches(user[1].toString(), Constants.hebRegex))
        err.push(Constants.errorMsg.firstNameHeb)
    //lastname
    if (!validator.matches(user[2].toString(), Constants.hebRegex))
        err.push(Constants.errorMsg.lastNameHeb)
    //phone
    if (!validator.isInt(user[3].toString()) && user[3].toString().length == 10)
        err.push(Constants.errorMsg.phoneErr)
    //email
    if (!validator.isEmail(user[6].toString()))
        err.push(Constants.errorMsg.emailErr)
    //sportClub
    if (!validator.isInt(user[7].toString()))
        err.push(Constants.errorMsg.sportClubErr)
    //sex
    if (!(user[8].toString() in Constants.sexEnum))
        err.push(Constants.errorMsg.sexErr)
    //branch
    if (!(user[9].toString() in Constants.sportType))
        err.push(Constants.errorMsg.sportTypeErr)
    //id coach
    if (!validator.isInt(user[10].toString(), {gt: 100000000, lt: 1000000000}))
        err.push(Constants.errorMsg.idCoachErr)

    return err;


}

async function insertSportsmanDB(trans, users, sportsmanDetails, i) {
    return trans.sql(` INSERT INTO user_Sportsman (id, firstname, lastname, phone, email, birthdate, address, sportclub, sex)
                                    VALUES (@idSportsman, @firstName, @lastName, @phone, @email, @birthDate, @address, @sportClub, @sex)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[0])
        .parameter('firstName', tediousTYPES.NVarChar, sportsmanDetails[1])
        .parameter('lastName', tediousTYPES.NVarChar, sportsmanDetails[2])
        .parameter('phone', tediousTYPES.Int, sportsmanDetails[3])
        .parameter('address', tediousTYPES.NVarChar, sportsmanDetails[4])
        .parameter('birthDate', tediousTYPES.Date, sportsmanDetails[5])
        .parameter('email', tediousTYPES.NVarChar, sportsmanDetails[6])
        .parameter('sportClub', tediousTYPES.Int, sportsmanDetails[7])
        .parameter('sex', tediousTYPES.NVarChar, sportsmanDetails[8])
        .parameter('sportType', tediousTYPES.NVarChar, sportsmanDetails[9])
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertSportsmanDB(trans, users, users[i + 1], i + 1)
            return testResult
        })

}

async function insertPasswordDB(trans, users, userDetails, i, userType) {
    return trans.sql(`INSERT INTO user_Passwords (id,password,usertype,isfirstlogin)
                    Values (@idSportsman ,@password,@userType,@isFirstLogin)`)
        .parameter('idSportsman', tediousTYPES.Int, userDetails[0])
        .parameter('password', tediousTYPES.NVarChar, bcrypt.hashSync(userDetails[0].toString(), saltRounds))
        .parameter('userType', tediousTYPES.Int, userType)
        .parameter('isFirstLogin', tediousTYPES.Int, 1)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertPasswordDB(trans, users, users[i + 1], (i + 1), userType)
            return testResult
        })
}

async function registerSportsman(users) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await insertSportsmanDB(trans, users, users[0], 0), await insertPasswordDB(trans, users, users[0], 0, Constants.userType.SPORTSMAN), await insertCoachDB(trans, users, users[0], 0)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = Constants.statusCode.ok;
                    ans.results = Constants.msg.registerSuccess
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = Constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                }))
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })

    return ans
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
async function insertCoachDB(trans, users, sportsmanDetails, i) {
    return trans.sql(`INSERT INTO sportsman_coach (idSportman,idCoach)
                    Values (@idSportsman,@idCoach)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[0])
        .parameter('idCoach', tediousTYPES.Int, sportsmanDetails[10])
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertCoachDB(trans, users, users[i + 1], (i + 1))
            return testResult
        })
}

async function sendEmail(users) {
    var subject = 'רישום משתמש חדש wuhsu'
    users.forEach((user) => {
        var textMsg = "שלום " + user[1] + "\n" +
            "הינך רשום למערכת של התאחדות האו-שו" + "\n" +
            "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
            + "שם פרטי: " + user[1] + "\n"
            + "שם משפחה: " + user[2] + "\n"
            + "כתובת מגורים: " + user[4] + "\n"
            + "פאלפון: " + user[3] + "\n"
            + "תאריך לידהי: " + user[5] + "\n"
            + "תעודת זהות: " + user[0] + "\n"
            + " שם המשתמש והסיסמא הראשונית שלך הינם תעודת הזהות שלך" + "\n\n\n"
            + "בברכה, " + "\n" +
            "מערכת או-שו"
        sysfunc.sendEmail(user[6], textMsg, subject)
    })


}

module.exports.registerSportsman = registerSportsman;
module.exports.checkDataBeforeRegister = checkDataBeforeRegister;