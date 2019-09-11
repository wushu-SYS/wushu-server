function getCoachSportsman(req,res,id) {
    DButilsAzure.execQuery(`select idSportman from sportsman_coach where idCoach= '${id}'`)
        .then(async (result) => {
            if (result.length>0) {
                var ans =[];
                for(var i=0;i<result.length;i++) {
                  await DButilsAzure.execQuery(`select id, firstname,lastname from user_Sportsman where id= '${result[i].idSportman}'`)
                            .then((res1) => {
                                 ans.push(res1[0])
                            })
                            .catch((err) => {
                                res.status(400).send(err)
                            })
                    }
            }
            console.log(ans)
            res.status(200).send(ans);
        })
        .catch((error) => {
            res.status(400).send(error)
        })
}


module.exports._getCoachSportsman = getCoachSportsman;
