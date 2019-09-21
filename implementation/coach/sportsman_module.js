const common_sportsman_module = require('../common/sportsman_module');

function getSportsmen(req, res, id){
    var query = '';
    var queryCount = '';
    var conditions = common_sportsman_module._buildConditions_forGetSportsmen(req, id);
    if(req.query.sportStyle !== undefined) {
        query = `Select user_Sportsman.id,firstname,lastname,photo
                    from user_Sportsman
                    join sportsman_category
                    on user_Sportsman.id = sportsman_category.id
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman`;
        queryCount = `Select count(*) as count
                    from user_Sportsman
                    join sportsman_category
                    on user_Sportsman.id = sportsman_category.id
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman`;
    }
    else if(req.query.competition !== undefined && req.query.competitionOperator !== undefined){
        if(req.query.competitionOperator == '=='){
            query = `select id, firstname, lastname, photo from
                    (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                        from user_Sportsman
                        join sportsman_coach
                        on user_Sportsman.id = sportsman_coach.idSportman
                        where sportsman_coach.idCoach = ${id}) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman`;
            queryCount = `select count(*) as count from
                    (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                        from user_Sportsman
                        join sportsman_coach
                        on user_Sportsman.id = sportsman_coach.idSportman
                        where idCoach = ${id}) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman`;
        }
        else if(req.query.competitionOperator == '!='){
            query = `Select id, firstname, lastname, photo from
                (Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where idCoach = ${id}
                except
                select id, firstname, lastname,photo from
                (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where sportsman_coach.idCoach = ${id}) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman`;
            queryCount = `Select count(*) as count from
                (Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where idCoach = ${id}
                except
                select id, firstname, lastname,photo from
                (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where sportsman_coach.idCoach = ${id}) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman`;
            conditions +=") as t";
        }
    }
    else {
        query = `Select id,firstname,lastname,photo
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman`;
        queryCount = `Select count(*) as count
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman`;
    }

    query += conditions;
    queryCount += conditions;
    query += common_sportsman_module._buildOrderBy_forGetSportsmen(req);

    Promise.all([DButilsAzure.execQuery(query), DButilsAzure.execQuery(queryCount)])
        .then(result => {
            resultJson = {
                sportsmen : result[0],
                totalCount : result[1][0].count
            };
            res.status(200).send(resultJson);
        })
        .catch((error) => {
            res.status(400).send(error + query)
        });
}

module.exports._getSportsmen = getSportsmen;