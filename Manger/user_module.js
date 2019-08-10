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


module.exports._registerCoach=registerCoach;
module.exports._watchProfile=watchProfile;