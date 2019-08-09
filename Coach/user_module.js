var DButilsAzure = require('../DButils');
const validation = require('node-input-validator');
const jwt = require("jsonwebtoken");
const Cryptr = require('cryptr');
secret = "wushuSecret";
const cryptr = new Cryptr(secret);


function registerSportman(req,res) {
    let validator = new validation( req.body, {
        Id:'required|integer',
        firstname:'required|lengthBetween:2,10',
        lastname:'required|lengthBetween:2,10',
        phone:'required|lengthBetween:0,10|integer',
        address:'required',
        email:'required|email',
        sportclub :'required|integer'
    });

    validator.check().then(function (matched) {
        if(!matched){
            res.status(400).send(validator.errors);
        }
        else{
            DButilsAzure.execQuery("select Id from user_Sportsman")
                .then( (result)=> {
                    var inUser = req.body.Id;
                    var reqUser = result
                    if (reqUser.some(item => item.Id == inUser)) {
                        res.status(400).send("The userName already exists " + inUser)
                    }
                })
            DButilsAzure.execQuery(` INSERT INTO user_Sportsman (Id,firstname,lastname,phone,email,birthdate,address,sportclub) 
                VALUES ('${(req.body.Id)}','${(req.body.firstname)}','${req.body.lastname}','${req.body.phone}','${req.body.email}','${req.body.birthdate}','${req.body.address}','${req.body.sportclub}')`)
                .then(async () => {
                     //await insertPassword(req, 3, 1)
                     //await insertCoach(req)
                    res.status(200).send("Registration completed successfully")
                })
                .catch((eror)=>{
                    res.status(400).send(eror)
                })
        }
    })

}
async function insertPassword(req, number, number2) {
    console.log("insert password");
    DButilsAzure.execQuery(`INSERT INTO user_Passwords (Id,password,usertype,isfirstlogin)
                    Values ('${req.body.Id}','${cryptr.encrypt(req.body.Id)}','${number}','${number2}')`)
        .catch((error)=>{
            res.status(400).send(error)
        })
}
async function insertCoach(req) {
    console.log("insert coach");
    DButilsAzure.execQuery(`INSERT INTO sportsman_coach (Idsportman,Idcoach)
                    Values ('${req.body.Id}','${req.body.coachId}')`)
        .catch((error)=>{
            res.status(400).send(error)
        })
}




module.exports._registerSportman = registerSportman;