function getSportclub(req,res){
    DButilsAzure.execQuery(` Select id,name from sportclub`)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((eror)=>{
            res.status(400).send(eror)
        })
}

module.exports._getSportClubs=getSportclub;
