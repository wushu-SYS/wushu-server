const bcrypt = require('bcrypt');
const saltRounds = 10;

function checkUserDetailsForLogin(userData) {
    var ans =new Object();
    dbUtils.sql(`select * from user_Passwords where id = @id`)
        .parameter('id', TYPES.Int, userData.userID)
        .execute()
        .then(async function(results) {
            if(results.length===0) {
                ans.isPassed = false
                ans.err=Constants.errorMsg.errLoginDetails
            }
            else{
                 ans.dbResults = results[0]
                 ans.isPassed =bcrypt.compareSync(req.body.password, result[0].password);
            }
            return ans;
        }).fail(function(err) {
            console.log(err)
    });
    /*
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

     */
}
async function getUserDetails(userData) {
    let result;
    switch (userData.dbResults.usertype) {
        case 1:
            result = await dbUtils.sql(`select firstname, lastname from user_Manger where id= '${userData.dbResults.id}'`).execute();
            break;
        case 2:
            result =await dbUtils.sql(`select firstname, lastname from user_Coach where id= '${userData.dbResults.id}'`).execute();
            break;
        case 3:
            result = await dbUtils.sql(`select firstname, lastname from user_Sportsman where id= '${userData.dbResults.id}'`).execute();
            break;
    }
    return result[0]

}
function buildToken(userDetails,userData){
    payload = { id: userData.dbResults.id, name: userDetails.firstname, access:userData.dbResults.usertype};
    options = { expiresIn: "1d" };
    const token = jwt.sign(payload, secret, options);
    return {
        'token' : token,
        'id' :userData.dbResults.id,
        'firstname' : userDetails.firstname,
        'lastname' : userDetails.lastname,
        'access' : userData.dbResults.usertype,
        'isFirstTime' : userData.dbResults.isfirstlogin
    };
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
    console.log(typeof saltRounds);
    console.log(typeof req.body.id);
    var hash = bcrypt.hashSync(req.body.id.toString(), saltRounds);
    DButilsAzure.execQuery(`INSERT INTO user_Passwords (id,password,usertype,isfirstlogin)
                    Values ('${req.body.id}','${hash}','${type}','${isFirstTime}')`)
        .catch((error) => {
            res.status(400).send(error)
        })
}
function downlaodExcelCoach(req,res){
    res.download('././resources/files/coachExcel.xlsx', 'coachExcel.xlsx', function (err) {}
)}
async function deleteSportsman(req,res){
    await DButilsAzure.execQuery(`DELETE FROM user_Sportsman WHERE id ='${req.body.userID}';`)
        .then(async ()=>{
              await DButilsAzure.execQuery(`DELETE FROM user_Passwords WHERE id ='${req.body.userID}';`)
              await DButilsAzure.execQuery(`DELETE FROM sportman_files WHERE id ='${req.body.userID}';`)
              await DButilsAzure.execQuery(`DELETE FROM sportsman_coach WHERE idSportman ='${req.body.userID}';`)
            res.status(200).send("sportsman has been deleted")
        })
        .catch((error) => {
            res.status(400).send(error)
        })
}



module.exports.buildToken=buildToken;
module.exports.checkUserDetailsForLogin = checkUserDetailsForLogin;
module.exports._uploadPhoto= uploadPhoto;
module.exports._downloadSportsmanExcel=downloadExcelSportsman;
module.exports._changePass=changePassword;
module.exports._downloadcoachExcel=downlaodExcelCoach;
module.exports._insertPassword=insertPassword;
module.exports.deleteSportsman=deleteSportsman;