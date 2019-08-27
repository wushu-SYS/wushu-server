const Cryptr = require('cryptr');
secret = "wushuSecret";
const cryptr = new Cryptr(secret);

function login(req,res) {
    var firstname;
    var id;
    DButilsAzure.execQuery(`select * from user_Passwords where Id = '${req.body.userID}'`)// AND password = '${pass}'`)
        .then(async (result) => {
            if(result.length === 0)
                res.status(401).send("Access denied. Error in user's details");
            else{
                var pass =cryptr.decrypt(result[0].password);
                if(pass===(req.body.password)) {
                    switch (result[0].usertype) {
                        case 1:
                            result1 = await DButilsAzure.execQuery(`select firstname, lastname from user_Manger where Id= '${result[0].Id}'`);
                            break;
                        case 2:
                            result1 = await DButilsAzure.execQuery(`select firstname, lastname from user_Coach where Id= '${result[0].Id}'`);
                            break;
                        case 3:
                            result1 = await DButilsAzure.execQuery(`select firstname, lastname from user_Sportsman where Id= '${result[0].Id}'`);
                            break;
                    }
                    firstname = result1[0].firstname;
                    lastname = result[0].lastname;
                }
                else
                    res.status(401).send("Access denied. Error in user's details");
                payload = { id: result[0].Id, name: firstname, access:result[0].usertype};
                options = { expiresIn: "1d" };
                const token = jwt.sign(payload, secret, options);
                resultJson = {
                    'token' : token,
                    'id' : result[0].Id,
                    'firstname' : firstname,
                    'lastname' : lastname,
                    'access' : result[0].usertype,
                    'isFirstTime' : result[0].isfirstlogin
                };
                res.send(resultJson);
            }})
        .catch(function(err){
            console.log(err)
            res.status(400).send(err)
        });
}
function uploadPhoto(req,res){
    var id =jwt.decode(req.header("x-auth-token")).id;
    switch (jwt.decode(req.header("x-auth-token")).access) {
        case 1:
            DButilsAzure.execQuery(`UPDATE user_Manger SET picture ='${"./uploades/Photos/"+id+".jpeg"}' WHERE Id = ${id};`)
            break;
        case 2:
            DButilsAzure.execQuery(`UPDATE user_Coach SET photo ='${"./uploades/Photos/"+id+".jpeg"}' WHERE Id = ${id};`)
            break;
        case 3:
            DButilsAzure.execQuery(`UPDATE user_Sportsman SET photo ='${"./uploades/Photos/"+id+".jpeg"}' WHERE Id = ${id};`)
            break;
    }
    res.status(200).send("File upload successfully")
}
function downlaodExcelSportsman(req,res){
    res.download('././resources/files/sportsmanExcel.xlsx', 'sportsmanExcel.xlsx', function (err) {}
)}
async function changePassword(req ,res){
    var id =jwt.decode(req.header("x-auth-token")).id;
    await DButilsAzure.execQuery(`Select password from user_Passwords where Id='${id}';`)
        .then((result)=>{
            if(cryptr.decrypt(result[0].password)==req.body.password)
                res.status(401).send("Password are the same cant change")
            else
                DButilsAzure.execQuery(`UPDATE user_Passwords SET password='${cryptr.encrypt(req.body.password)}',isFirstLogin = 0 where Id='${id}';`)
                    .then(()=>{
                            res.status(200).send("password update successfully")
                        }
                    )
                    .catch((error)=>{
                        res.status(404).send(error);
                    })
        })
        .catch((error)=>{
            res.status(404).send(error);
        })

}
async function insertPassword(req, type, isFirstTime) {
    console.log("insert password");
    DButilsAzure.execQuery(`INSERT INTO user_Passwords (Id,password,usertype,isfirstlogin)
                    Values ('${req.body.id}','${cryptr.encrypt(req.body.id)}','${type}','${isFirstTime}')`)
        .catch((error) => {
            res.status(400).send(error)
        })
}

function getSportclub(req,res){
    DButilsAzure.execQuery(` Select id,name from sportclub`)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((eror)=>{
            res.status(400).send(eror)
        })
}

function downlaodExcelCoach(req,res){
    res.download('././resources/files/coachExcel.xlsx', 'coachExcel.xlsx', function (err) {}
)}

function getSportsmen(req, res){
    DButilsAzure.execQuery(`Select Id,firstname,lastname from user_Sportsman`)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((eror) => {
            res.status(400).send(eror)
        })
}
function getCoachSportamen(req, res, id){
    DButilsAzure.execQuery(` Select Id,firstname,lastname
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.Id = sportsman_coach.Idsportman
                    where sportsman_coach.Idcoach = '${id}'`)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((eror) => {
            res.status(400).send(eror)
        })
}

module.exports._login = login;
module.exports._uploadPhoto= uploadPhoto;
module.exports._downloadSportsmanExcel=downlaodExcelSportsman;
module.exports._changePass=changePassword;
module.exports._getSportClubs=getSportclub;
module.exports._getSportsmen = getSportsmen;
module.exports._getCoachSportsmen = getCoachSportamen;
module.exports._downloadcoachExcel=downlaodExcelCoach;
module.exports._insertPassword=insertPassword;