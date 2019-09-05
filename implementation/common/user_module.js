const bcrypt = require('bcrypt');
const saltRounds = 10;

function login(req,res) {
    var isAuthorized=false;
    var firstname;
    var lastname;
    var id;
    DButilsAzure.execQuery(`select * from user_Passwords where id = '${req.body.userID}'`)// AND password = '${pass}'`)
        .then(async (result) => {
            if(result.length === 0)
                res.status(401).send("Access denied. Error in user's details");
            else{
                isAuthorized =bcrypt.compareSync(req.body.password, result[0].password);
                if(isAuthorized) {
                    switch (result[0].usertype) {
                        case 1:
                            result1 = await DButilsAzure.execQuery(`select firstname, lastname from user_Manger where id= '${result[0].id}'`);
                            break;
                        case 2:
                            result1 = await DButilsAzure.execQuery(`select firstname, lastname from user_Coach where id= '${result[0].id}'`);
                            break;
                        case 3:
                            result1 = await DButilsAzure.execQuery(`select firstname, lastname from user_Sportsman where id= '${result[0].id}'`);
                            break;
                    }
                    firstname = result1[0].firstname;
                    lastname = result1[0].lastname;
                }
                else
                    res.status(401).send("Access denied. Error in user's details");
                payload = { id: result[0].id, name: firstname, access:result[0].usertype};
                options = { expiresIn: "1d" };
                const token = jwt.sign(payload, secret, options);
                resultJson = {
                    'token' : token,
                    'id' : result[0].id,
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
            DButilsAzure.execQuery(`UPDATE user_Manger SET picture ='${"./uploades/Photos/"+id+".jpeg"}' WHERE id = ${id};`)
            break;
        case 2:
            DButilsAzure.execQuery(`UPDATE user_Coach SET photo ='${"./uploades/Photos/"+id+".jpeg"}' WHERE id = ${id};`)
            break;
        case 3:
            DButilsAzure.execQuery(`UPDATE user_Sportsman SET photo ='${"./uploades/Photos/"+id+".jpeg"}' WHERE id = ${id};`)
            break;
    }
    res.status(200).send("File upload successfully")
}
function downloadExcelSportsman(req,res){
    res.download('././resources/files/sportsmanExcel.xlsx', 'sportsmanExcel.xlsx', function (err) {}
)}
async function changePassword(req ,res){
    var isThesame=false;
    var id =jwt.decode(req.header("x-auth-token")).id;
    await DButilsAzure.execQuery(`Select password from user_Passwords where id='${id}';`)
        .then((result)=>{
            isThesame =bcrypt.compareSync(req.body.password, result[0].password);
              if(isThesame)
                res.status(401).send("Password are the same cant change")
            else {
                  var hash = bcrypt.hashSync(req.body.password, saltRounds);
                  DButilsAzure.execQuery(`UPDATE user_Passwords SET password='${hash}',isFirstLogin = 0 where id='${id}';`)
                      .then(() => {
                              res.status(200).send("password update successfully")
                          }
                      )
                      .catch((error) => {
                          res.status(404).send(error);
                      })
              }
        })
        .catch((error)=>{
            res.status(404).send(error);
        })

}
async function insertPassword(req, type, isFirstTime) {
    var hash = bcrypt.hashSync(req.body.id, saltRounds);
    DButilsAzure.execQuery(`INSERT INTO user_Passwords (id,password,usertype,isfirstlogin)
                    Values ('${req.body.id}','${hash}','${type}','${isFirstTime}')`)
        .catch((error) => {
            res.status(400).send(error)
        })
}
function downlaodExcelCoach(req,res){
    res.download('././resources/files/coachExcel.xlsx', 'coachExcel.xlsx', function (err) {}
)}

// function sportsmanProfile(req, res){
//     DButilsAzure.execQuery(`Select * from user_Sportsman where id like ${req.body.id}`)
//         .then((result) => {
//             if(jwt.decode(req.header("x-auth-token")).access===userType.MANAGER)
//                 res.status(200).send(result);
//             else if(jwt.decode(req.header("x-auth-token")).access===userType.COACH)
//                 res.status(500).send("NEED TO IMPLEMENT IT");
//             else if(jwt.decode(req.header("x-auth-token")).access === userType.SPORTSMAN && jwt.decode(req.header("x-auth-token")).id === result[0].id)
//                 res.status(200).send(result);
//             else
//                 res.status(400).send("Permission denied")
//         })
//         .catch((eror) => {
//             res.status(400).send(eror)
//         })
// }

module.exports._login = login;
module.exports._uploadPhoto= uploadPhoto;
module.exports._downloadSportsmanExcel=downloadExcelSportsman;
module.exports._changePass=changePassword;
module.exports._downloadcoachExcel=downlaodExcelCoach;
module.exports._insertPassword=insertPassword;