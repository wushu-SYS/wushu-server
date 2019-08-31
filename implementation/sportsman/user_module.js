
function uploadeMedical(req,res) {
    var id =jwt.decode(req.header("x-auth-token")).id;
    DButilsAzure.execQuery(`Select * from sportman_files where Id ='${id}'`)
        .then((result)=>{
            if(result.length==0)
                DButilsAzure.execQuery(`Insert INTO sportman_files (Id,medicalscan) Values ('${id}','${"./uploades/sportsman/MedicalScan/"+id+".jpeg"}')`)
                    .then(()=>{
                        res.status(200).send("File upload successfully")
                    })
            else
                DButilsAzure.execQuery(`UPDATE sportman_files SET medicalscan ='${"./uploades/sportsman/MedicalScan/"+id+".jpeg"}' WHERE Id = ${id};`)
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
                DButilsAzure.execQuery(`Insert INTO sportman_files (Id,insurance) Values ('${id}','${"./uploades/sportsman/InsuranceScan/"+id+".jpeg"}')`)
                    .then(()=>{
                        res.status(200).send("File upload successfully")
                    })
            else
                DButilsAzure.execQuery(`UPDATE sportman_files SET medicalscan ='${"./uploades/sportsman/InsuranceScan/"+id+".jpeg"}' WHERE Id = ${id};`)
                    .then(()=>{
                        res.status(200).send("File upload successfully")
                    })
        })
        .catch((error)=>{
            res.status(400).send(error)
        })

}

module.exports._uploadeMedical = uploadeMedical;
module.exports._uploadInsurances=uploadeInsurance;
