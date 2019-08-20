var DButilsAzure = require('../DButils');
const validation = require('node-input-validator');
const jwt = require("jsonwebtoken");
const Cryptr = require('cryptr');
secret = "wushuSecret";
const cryptr = new Cryptr(secret);


function registerCoach(req,res) {
    let validator = new validation(req.body, {
        id: 'required|integer|minLength:9|maxLength:10',
        firstname: 'required|lengthBetween:1,10',
        lastname: 'required|lengthBetween:1,10',
        phone: 'required|minLength:10|maxLength:10|integer',
        address: 'required',
        email: 'required|email',
        sportclub: 'required',
        birthdate: 'required',
        branch: 'required',
        teamname: 'required'
    });
    var regex = new RegExp("^[\u0590-\u05fe]+$");
    var initial = req.body.birthdate.split("-");
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(400).send(validator.errors);
        }
        else if(!regex.test(req.body.firstname)){
            res.status(400).send("First name must be in hebrew");
        }
        else if(!regex.test(req.body.lastname)){
            res.status(400).send("Last name must be in hebrew");
        }
        else if(!regex.test(req.body.teamname)){
            res.status(400).send("team name must be in hebrew");
        }
        else if(initial.length != 3){
            res.status(400).send("The birthdate must be a valid date");
        }
        else {
            DButilsAzure.execQuery("select Id from user_Coach")
                .then((result) => {
                    var inUser = req.body.Id;
                    if (result.some(item => item.Id === inUser)) {
                        res.status(400).send("The userName already exists " + inUser)
                    } else {
                        DButilsAzure.execQuery(`select id from sportclub where name = '${req.body.sportclub}'`)
                            .then((result) => {
                                req.body.birthdate = ( [ initial[1], initial[0], initial[2] ].join('/'));
                                DButilsAzure.execQuery(` INSERT INTO user_Coach (Id, firstname, lastname, phone, email, birthdate, address, sportclub) 
                                     VALUES ('${(req.body.id)}','${(req.body.firstname)}','${req.body.lastname}','${req.body.phone}','${req.body.email}','${req.body.birthdate}','${req.body.address}','${result}')`)
                                            .then(async () => {
                                                await insertCoachTeam(req);
                                                res.status(200).send("Registration completed successfully")
                                            })
                                    })
                    }
                })
                .catch((error) => {
                    res.status(400).send(error)
                })
        }
    });
}

async function insertCoachTeam(req) {
    console.log("insert coach team");
    DButilsAzure.execQuery(`INSERT INTO coach_team (Id,branch,teamname)
                    Values ('${req.body.id}','${req.body.branch}','${req.body.teamname}')`)
        .catch((error) => {
            res.status(400).send(error)
        })
}

function watchProfile(req,res){

}
function getCoaches(req, res) {
    DButilsAzure.execQuery(` Select Id,firstname,lastname from user_Coach`)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((eror) => {
            res.status(400).send(eror)
        })
}

module.exports._registerCoach=registerCoach;
module.exports._watchProfile=watchProfile;
module.exports._getCoaches = getCoaches;