function buildConditions_forGetSportsmen(req, id){
    let club = req.query.club;
    let sex = req.query.sex;
    let branch = req.query.branch;
    let value = req.query.value;
    var conditions = [];

    if(id !== null && id != undefined) {
        conditions.push(`sportsman_coach.Idcoach = '${id}'`);
    }
    if(value !== '' && value !== undefined) {
        conditions.push("(firstname like '%" + value + "%' or lastname like '%" + value + "%')");
    }
    if(branch !== '' && branch !== undefined){
        conditions.push("branch like '" + branch + "'");
    }
    if(club !== '' && club !== undefined){
        conditions.push("sportclub like " + club);
    }
    if(sex !== '' && sex !== undefined){
        conditions.push("sex like '" + sex + "'");
    }
    return conditions.length ? ' where ' + conditions.join(' and ') : '';
}
function buildOrderBy_forGetSportsmen(req){
    let sort = req.query.sort;
    if(sort !== '' && sort !== undefined && sort === 'desc')
        return ' order by firstname desc';
    else
        return ' order by firstname';
}

function sportsmanProfile(req, res){
    DButilsAzure.execQuery(`Select * from user_Sportsman where Id like ${req.body.id}`)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((error) => {
            res.status(400).send(error)
        })
}

module.exports._buildConditions_forGetSportsmen = buildConditions_forGetSportsmen;
module.exports._buildOrderBy_forGetSportsmen = buildOrderBy_forGetSportsmen;
module.exports._sportsmanProfile = sportsmanProfile;