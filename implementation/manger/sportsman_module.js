const common_sportsman_module = require('../common/sportsman_module');

function getSportsmen(req, res){
    var query = '';
    var queryCount = '';
    var conditions = common_sportsman_module._buildConditions_forGetSportsmen(req);
    if(req.query.sportStyle != undefined) {
        query = `Select user_Sportsman.id, firstname, lastname, photo from user_Sportsman join sportsman_category
            on user_Sportsman.id = sportsman_category.id`;
        queryCount = `Select count(*) as count from user_Sportsman join sportsman_category
            on user_Sportsman.id = sportsman_category.id`;
    }
    else if(req.query.competition !== undefined && req.query.competitionOperator !== undefined){
        if(req.query.competitionOperator === '=='){
            query = `Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman`;
            queryCount = `Select count(*) as count
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman`;
        }
        else if(req.query.competitionOperator === '!='){
            query = `Select id, firstname, lastname, photo from
                (Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                except
                Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                    left join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    where idCompetition = ${req.query.competition}) as t`;
            queryCount = `Select count(*) as count from
                (Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                except
                Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                    left join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    where idCompetition = ${req.query.competition}) as t`;
        }
    }
    else {
        query = 'Select id, firstname, lastname, photo from user_Sportsman';
        queryCount = 'Select count(*) as count from user_Sportsman';
    }
    query += conditions;
    queryCount +=conditions;
    query += common_sportsman_module._buildOrderBy_forGetSportsmen(req);
    console.log(query);

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
