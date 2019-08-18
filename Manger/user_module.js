var DButilsAzure = require('../DButils');
const validation = require('node-input-validator');
const jwt = require("jsonwebtoken");
const Cryptr = require('cryptr');
secret = "wushuSecret";
const cryptr = new Cryptr(secret);

function registerCoach(req,res) {

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