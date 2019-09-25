
function uploadeMedical(req,res) {
    var id =jwt.decode(req.header("x-auth-token")).id;
    DButilsAzure.execQuery(`Select * from sportman_files where id ='${id}'`)
        .then((result)=>{
            if(result.length==0)
                DButilsAzure.execQuery(`Insert INTO sportman_files (id,medicalscan) Values ('${id}','${"./uploades/sportsman/MedicalScan/"+id+".jpeg"}')`)
                    .then(()=>{
                        res.status(200).send("File upload successfully")
                    })
            else
                DButilsAzure.execQuery(`UPDATE sportman_files SET medicalscan ='${"./uploades/sportsman/MedicalScan/"+id+".jpeg"}' WHERE id = ${id};`)
                    .then(()=>{
                        res.status(200).send("File upload successfully")
                    })
        })
        .catch((error)=>{
            res.status(400).send(error)
            })
}
function uploadeInsurance(req,res) {
    var id =jwt.decode(req.header("x-auth-token")).id;
    DButilsAzure.execQuery(`Select * from sportman_files where id ='${id}'`)
        .then((result)=>{
            if(result.length==0)
                DButilsAzure.execQuery(`Insert INTO sportman_files (id,insurance) Values ('${id}','${"./uploades/sportsman/InsuranceScan/"+id+".jpeg"}')`)
                    .then(()=>{
                        res.status(200).send("File upload successfully")
                    })
            else
                DButilsAzure.execQuery(`UPDATE sportman_files SET medicalscan ='${"./uploades/sportsman/InsuranceScan/"+id+".jpeg"}' WHERE id = ${id};`)
                    .then(()=>{
                        res.status(200).send("File upload successfully")
                    })
        })
        .catch((error)=>{
            res.status(400).send(error)
        })

}

async function sendMail(req) {
    const send = require('gmail-send')({
        user: 'wushuSys@gmail.com',
        pass: 'ktrxyruavpyiqfav',
        to:   req.body.email,
        subject: 'עדכון פרטי משתמש',
    });
    var textMsg = "שלום "+req.body.firstname+"\n"+
        "לבקשתך עודכנו הפרטים האישים שלך במערכת"+"\n"+
    "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי"+"\n"
    +"שם פרטי: "+req.body.firstname+"\n"
    +"שם משפחה: "+req.body.lastname+"\n"
    +"כתובת מגורים: "+req.body.address+"\n"
    +"פאלפון: "+req.body.phone+"\n"
    +"תאריך לידה: "+req.body.birthdate+"\n"
    +"תעודת זהות: "+req.body.id+"\n"
    +"בברכה, מערכת או-שו"
    send({
        text:  textMsg,
    }, (error, result, fullResult) => {
        if (error) console.error(error);
        console.log(result);
    })

}

function updateProfile(req,res){
    let validator = new validation(req.body, {
        id: 'required|integer|minLength:9|maxLength:9',
        firstname: 'required|lengthBetween:2,10',
        lastname: 'required|lengthBetween:2,10',
        phone: 'required|minLength:10|maxLength:10|integer',
        address: 'required',
        email: 'required|email',
        birthdate: 'required',
        sex: 'required',
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
            DButilsAzure.execQuery(`UPDATE user_Sportsman SET id ='${req.body.id}',firstname = '${req.body.firstname}', lastname = '${req.body.lastname}',phone = '${req.body.phone}',email = '${req.body.email}',birthdate = '${req.body.birthdate}',
                                    address = '${req.body.address}',sex = '${req.body.sex}' where id ='${req.body.id}';`)
                .then(async (result) => {
                    await sendMail(req)
                    res.status(200).send("Update successfully")
                })
                .catch((error) => {
                    res.status(400).send(error)
                })
        }
    });
}

module.exports._uploadeMedical = uploadeMedical;
module.exports._uploadInsurances=uploadeInsurance;
module.exports._updateSportsmanProfile=updateProfile;