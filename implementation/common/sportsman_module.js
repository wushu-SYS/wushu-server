function buildConditions_forGetSportsmen(req, id){
    let club = req.query.club;
    let sex = req.query.sex;
    let branch = req.query.branch;
    let value = req.query.value;
    var conditions = [];

    if(id !== null && id != undefined) {
        conditions.push(`sportsman_coach.idCoach = '${id}'`);
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

function sportsmanProfile(id, res){
    DButilsAzure.execQuery(`Select user_Sportsman.id, user_Sportsman.firstname as sfirstname, user_Sportsman.lastname as slastname, user_Sportsman.photo, user_Sportsman.phone, user_Sportsman.email, user_Sportsman.phone, user_Sportsman.birthdate, user_Sportsman.address, sex, user_Coach.firstname as cfirstname, user_Coach.lastname clastname, name as club
                                    from user_Sportsman
                                    join sportsman_coach on user_Sportsman.id = sportsman_coach.idSportman
                                    join user_Coach on sportsman_coach.idCoach = user_Coach.id
                                    join sportclub on user_Sportsman.sportclub = sportclub.id
                                    where user_Sportsman.id like ${id}`)
        .then((result) => {
            res.status(200).send(result[0])
        })
        .catch((error) => {
            res.status(400).send(error)
        })
}

module.exports._buildConditions_forGetSportsmen = buildConditions_forGetSportsmen;
module.exports._buildOrderBy_forGetSportsmen = buildOrderBy_forGetSportsmen;
module.exports._sportsmanProfile = sportsmanProfile;