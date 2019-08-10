var DButilsAzure = require('../DButils');
const jwt = require("jsonwebtoken");
const Cryptr = require('cryptr');
secret = "wushuSecret";
const cryptr = new Cryptr(secret);

function uploadeMedical(req,res) {
    var id =jwt.decode(req.header("x-auth-token")).id;
    DButilsAzure.execQuery(`Select * from sportman_files where Id ='${id}'`)
        .then((result)=>{
            if(result.length==0)
                DButilsAzure.execQuery(`Insert INTO sportman_files (Id,medicalscan) Values ('${id}','${"./uploades/Sportsman/MedicalScan/"+id+".jpeg"}')`)
                    .then(()=>{
                        res.status(200).send("File upload successfully")
                    })
            else
                DButilsAzure.execQuery(`UPDATE sportman_files SET medicalscan ='${"./uploades/Sportsman/MedicalScan/"+id+".jpeg"}' WHERE Id = ${id};`)
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
    DButilsAzure.execQuery(`Select * from sportman_files where Id ='${id}'`)
        .then((result)=>{
            if(result.length==0)
                DButilsAzure.execQuery(`Insert INTO sportman_files (Id,insurance) Values ('${id}','${"./uploades/Sportsman/InsuranceScan/"+id+".jpeg"}')`)
                    .then(()=>{
                        res.status(200).send("File upload successfully")
                    })
            else
                DButilsAzure.execQuery(`UPDATE sportman_files SET medicalscan ='${"./uploades/Sportsman/InsuranceScan/"+id+".jpeg"}' WHERE Id = ${id};`)
                    .then(()=>{
                        res.status(200).send("File upload successfully")
                    })
        })
        .catch((error)=>{
            res.status(400).send(error)
        })

}
function watchProfile(req,res){

}

module.exports._uploadeMedical = uploadeMedical;
module.exports._uploadInsurances=uploadeInsurance;
module.exports._watchProfile=watchProfile;
