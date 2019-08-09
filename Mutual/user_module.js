var DButilsAzure = require('../DButils');
const jwt = require("jsonwebtoken");
const Cryptr = require('cryptr');
secret = "wushuSecret";
const cryptr = new Cryptr(secret);



function login(req,res) {
    var firstname;
    var id;
    DButilsAzure.execQuery(`select Id,password,usertype from user_Passwords
            where Id = '${req.body.userID}'`)// AND password = '${pass}'`)
        .then((result) => {
            if(result.length == 0)
                res.status(401).send("Access denied. Error in user's details")
            else{
                var pass =cryptr.decrypt(result[0].password);
                if(pass==(req.body.password))
                    switch (result[0].usertype) {
                        case 1:
                            DButilsAzure.execQuery(`select firstname from user_Manger where Id= '${result[0].Id}'`)
                                .then((result1)=>{
                                    firstname=result1[0].firstname
                                    id=result[0].Id
                                })
                            break;
                        case 2:
                            console.log("coach")
                            break;
                        case 3:
                            DButilsAzure.execQuery(`select firstname from user_Sportman where Id= '${result[0].Id}'`)
                                .then((result1)=>{
                                    firstname=result1[0].firstname
                                    id=result[0].Id
                                })
                            break;
                    }
                else
                    res.status(401).send("Access denied. Error in user's details")
                payload = { id: result[0].Id, name: firstname, access:result[0].usertype};
                options = { expiresIn: "1d" };
                const token = jwt.sign(payload, secret, options);
                res.send(token);
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


module.exports._login = login;
module.exports._uploadPhoto= uploadPhoto;
