const sysfunc = require("../commonFunc")


function uploadeMedical(req, res) {
    var id = jwt.decode(req.header("x-auth-token")).id;
    DButilsAzure.execQuery(`Select * from sportman_files where id ='${id}'`)
        .then((result) => {
            if (result.length == 0)
                DButilsAzure.execQuery(`Insert INTO sportman_files (id,medicalscan) Values ('${id}','${"./uploades/sportsman/MedicalScan/" + id + ".jpeg"}')`)
                    .then(() => {
                        res.status(200).send("File upload successfully")
                    })
            else
                DButilsAzure.execQuery(`UPDATE sportman_files SET medicalscan ='${"./uploades/sportsman/MedicalScan/" + id + ".jpeg"}' WHERE id = ${id};`)
                    .then(() => {
                        res.status(200).send("File upload successfully")
                    })
        })
        .catch((error) => {
            res.status(400).send(error)
        })
}

function uploadeInsurance(req, res) {
    var id = jwt.decode(req.header("x-auth-token")).id;
    DButilsAzure.execQuery(`Select * from sportman_files where id ='${id}'`)
        .then((result) => {
            if (result.length == 0)
                DButilsAzure.execQuery(`Insert INTO sportman_files (id,insurance) Values ('${id}','${"./uploades/sportsman/InsuranceScan/" + id + ".jpeg"}')`)
                    .then(() => {
                        res.status(200).send("File upload successfully")
                    })
            else
                DButilsAzure.execQuery(`UPDATE sportman_files SET medicalscan ='${"./uploades/sportsman/InsuranceScan/" + id + ".jpeg"}' WHERE id = ${id};`)
                    .then(() => {
                        res.status(200).send("File upload successfully")
                    })
        })
        .catch((error) => {
            res.status(400).send(error)
        })

}

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
    await sysfunc.sendEmail(req.body.email, subject, textMsg)
}


function validateSportsmanData(sportsmanDetails) {
    let res = new Object();
    res.isPassed = true;
    let tmpErr = validateData(sportsmanDetails)
    sportsmanDetails[5] = sysfunc.setBirtdateFormat(sportsmanDetails[5])
    if (tmpErr.length != 0) {
        ans.status = Constants.statusCode.badRequest;
        res.isPassed = false;
        res.results = tmpErr;
    }
    res.data = sportsmanDetails;
    return res;
}

function validateData(sportsmanDetails) {
    let err = [];

    //id user
    if (!validator.isInt(sportsmanDetails[0].toString(), {gt: 100000000, lt: 1000000000}))
        err.push(Constants.errorMsg.idSportmanErr);
    //firstName
    if (!validator.matches(sportsmanDetails[1].toString(), Constants.hebRegex))
        err.push(Constants.errorMsg.firstNameHeb);
    //lastName
    if (!validator.matches(sportsmanDetails[2].toString(), Constants.hebRegex))
        err.push(Constants.errorMsg.lastNameHeb);
    //phone
    if (!validator.isInt(sportsmanDetails[3].toString()) && sportsmanDetails[3].toString().length == 10)
        err.push(Constants.errorMsg.phoneErr);
    //email
    if (!validator.isEmail(sportsmanDetails[4].toString()))
        err.push(Constants.errorMsg.emailErr);
    //sex
    if (!(sportsmanDetails[7].toString() in Constants.sexEnum))
        err.push(Constants.errorMsg.sexErr);

    return err

}

async function updateSportsmanProfile(sportsManDetails) {
    let ans = new Object();
    await dbUtils.sql(`UPDATE user_Sportsman SET id =@idSportsman,firstname = @firstName', lastname = @lastName,phone = @phone,email = @email,birthdate = @birthDate,
                      address = @address,sex = @sex where id =@idSportsman;`)
        .parameter('idSportsman', tediousTYPES.Int, sportsManDetails[0])
        .parameter('firstName', tediousTYPES.NVarChar, sportsManDetails[1])
        .parameter('lastName', tediousTYPES.NVarChar, sportsManDetails[2])
        .parameter('phone', tediousTYPES.Int, sportsManDetails[3])
        .parameter('email', tediousTYPES.NVarChar, sportsManDetails[4])
        .parameter('birthDate', tediousTYPES.Date, sportsManDetails[5])
        .parameter('address', tediousTYPES.NVarChar, sportsManDetails[6])
        .parameter('sex', tediousTYPES.NVarChar, sportsManDetails[7])
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.updateUserDetails;
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

module.exports._uploadeMedical = uploadeMedical;
module.exports._uploadInsurances = uploadeInsurance;
module.exports.updateSportsmanProfile = updateSportsmanProfile;