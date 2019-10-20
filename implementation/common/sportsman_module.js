function buildConditions_forGetSportsmen(queryData, id){
    let club = queryData.club;
    let sex = queryData.sex;
    let sportStyle = queryData.sportStyle;
    let compId = queryData.competition;
    let value = queryData.value;
    var conditions = [];

    if(id !== null && id != undefined && (queryData.competitionOperator === undefined || queryData.competitionOperator === '==')) {
        conditions.push(`sportsman_coach.idCoach = @idCoach`);
    }
    if(value !== '' && value !== undefined) {
        conditions.push("(firstname like '%@value%' or lastname like '%@value%')");
    }
    if(sportStyle !== '' && sportStyle !== undefined){
        conditions.push("sportStyle like @sportStyle");
    }
    if(club !== '' && club !== undefined){
        conditions.push("sportclub like @club");
    }
    if(sex !== '' && sex !== undefined){
        conditions.push("sex like @sex");
    }
    if(compId !== '' && compId !== undefined && queryData.competitionOperator !== undefined && queryData.competitionOperator === '=='){
        conditions.push(`idCompetition = @compId`);
    }
    return conditions.length ? ' where ' + conditions.join(' and ') : '';
}
function buildOrderBy_forGetSportsmen(queryData){
    let sort = queryData.sort;
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

function getCategories(req, res){
    DButilsAzure.execQuery(`Select * from category order by name`)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((error)=>{
            res.status(400).send(error)
        })
}

module.exports.buildConditions_forGetSportsmen = buildConditions_forGetSportsmen;
module.exports.buildOrderBy_forGetSportsmen = buildOrderBy_forGetSportsmen;
module.exports._sportsmanProfile = sportsmanProfile;
module.exports._getCategories = getCategories;