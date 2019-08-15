var DButilsAzure = require('../DButils');
const validation = require('node-input-validator');
const jwt = require("jsonwebtoken");
const Cryptr = require('cryptr');
secret = "wushuSecret";
const cryptr = new Cryptr(secret);


function registerSportman(req,res) {
/*
    let validator = new validation(req.body, {
        id: 'required|integer',
        firstname: 'required|lengthBetween:2,10',
        lastname: 'required|lengthBetween:2,10',
        phone: 'required|lengthBetween:0,15|',
        address: 'required',
        email: 'required|email',
        sportclub: 'required',
        sex: 'required',
        branch: 'required'

    });
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(400).send(validator.errors);
        } else {


 */
            DButilsAzure.execQuery("select Id from user_Sportsman")
                .then((result) => {
                    var inUser = req.body.Id;
                    var reqUser = result
                    if (reqUser.some(item => item.Id == inUser)) {
                        res.status(400).send("The userName already exists " + inUser)
                    } else {
                        DButilsAzure.execQuery(`select id from sportclub where name = '${req.body.sportclub}'`)
                            .then((result) => {
                                DButilsAzure.execQuery(` INSERT INTO user_Sportsman (Id,firstname,lastname,phone,email,birthdate,address,sportclub,sex) 
                                     VALUES ('${(req.body.id)}','${(req.body.firstname)}','${req.body.lastname}','${req.body.phone}','${req.body.email}','${req.body.birthdate}','${req.body.address}','${result}','${req.body.sex}')`)
                                    .then( async() => {
                                        await insertSportsmanCategory(req)
                                        await insertPassword(req, 3, 1)
                                        await insertCoach(req)
                                        res.status(200).send("Registration completed successfully")
                                    })
                                    .catch((eror) => {
                                        res.status(400).send(eror)
                                    })
                            })
                            .catch((error) => {
                                res.status(400).send(error)
                            })
                    }
                })
      //  }

    //})
}

function watchProfile(req,res){

}
function getCoaches(req,res){
    DButilsAzure.execQuery(` Select Id,firstname,lastname from user_Coach`)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((eror)=>{
            res.status(400).send(eror)
        })
}




async function insertSportsmanCategory(req){
    console.log("insert sportsman Category");
    DButilsAzure.execQuery(`INSERT INTO sportsman_category (Id,branch)
                    Values ('${req.body.id}','${req.body.branch}')`)
        .catch((error)=>{
            res.status(400).send(error)
        })
}
async function insertPassword(req, number, number2) {
    console.log("insert password");
    DButilsAzure.execQuery(`INSERT INTO user_Passwords (Id,password,usertype,isfirstlogin)
                    Values ('${req.body.id}','${cryptr.encrypt(req.body.id)}','${number}','${number2}')`)
        .catch((error)=>{
            res.status(400).send(error)
        })
}
async function insertCoach(req) {
    console.log("insert coach");
    DButilsAzure.execQuery(`INSERT INTO sportsman_coach (Idsportman,Idcoach)
                    Values ('${req.body.id}','${req.body.idCoach}')`)
        .catch((error)=>{
            res.status(400).send(error)
        })
}




module.exports._registerSportman = registerSportman;
module.exports._watchProfile =watchProfile;
module.exports._getCoaches=getCoaches;