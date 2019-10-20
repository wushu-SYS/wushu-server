const common_sportsman_module = require('../common/sportsman_module');

async function getSportsmen(queryData){
    let ans = new Object();
    let conditions = common_sportsman_module.buildConditions_forGetSportsmen(queryData);
    let query = buildQuery_forGetSportsman(queryData);
    query.query += conditions;
    query.queryCount +=conditions;
    query.query += common_sportsman_module.buildOrderBy_forGetSportsmen(queryData);

   await Promise.all([dbUtils.sql(query.query)
        .parameter('idCoach', tediousTYPES.Int, queryData.idCoach)
        .parameter('value', tediousTYPES.NVarChar, queryData.value)
        .parameter('sportStyle', tediousTYPES.NVarChar, queryData.sportStyle)
        .parameter('club', tediousTYPES.NVarChar, queryData.club)
        .parameter('sex', tediousTYPES.NVarChar, queryData.sex)
        .parameter('compId', tediousTYPES.Int, queryData.competition)
        .execute()
        .fail((err)=>{console.log(err)}),
        dbUtils.sql(query.queryCount)
            .parameter('idCoach', tediousTYPES.Int, queryData.idCoach)
            .parameter('value', tediousTYPES.NVarChar, queryData.value)
            .parameter('sportStyle', tediousTYPES.NVarChar, queryData.sportStyle)
            .parameter('club', tediousTYPES.NVarChar, queryData.club)
            .parameter('sex', tediousTYPES.NVarChar, queryData.sex)
            .parameter('compId', tediousTYPES.Int, queryData.competition)
            .execute()
            .fail((err)=>{console.log(err)}),
    ])
        .then(result => {
            ans.results = {
                sportsmen : result[0],
                totalCount : result[1][0].count
            };
            ans.status = Constants.statusCode.ok;
        })
        .catch((error) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = error;
        });
    return ans
}

function buildQuery_forGetSportsman(queryData){
    let query = new Object();
    if(queryData.sportStyle != undefined) {
        query.query = `Select user_Sportsman.id, firstname, lastname, photo from user_Sportsman join sportsman_category
            on user_Sportsman.id = sportsman_category.id`;
        query.queryCount = `Select count(*) as count from user_Sportsman join sportsman_category
            on user_Sportsman.id = sportsman_category.id`;
    }
    else if(queryData.competition !== undefined && queryData.competitionOperator !== undefined){
        if(queryData.competitionOperator === '=='){
            query.query = `Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman`;
            query.queryCount = `Select count(*) as count
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman`;
        }
        else if(queryData.competitionOperator === '!='){
            query.query = `Select id, firstname, lastname, photo, sex, age, sportclub from
                (Select user_Sportsman.id, firstname, lastname, photo, sex, FLOOR(DATEDIFF(DAY, birthdate, getdate()) / 365.25) as age, sportclub
                    from user_Sportsman
                except
                Select user_Sportsman.id, firstname, lastname, photo, sex, FLOOR(DATEDIFF(DAY, birthdate, getdate()) / 365.25) as age, sportclub
                    from user_Sportsman
                    left join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    where idCompetition = @compId) as t`;
            query.queryCount = `Select count(*) as count from
                (Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                except
                Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                    left join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    where idCompetition = @compId) as t`;
        }
    }
    else {
        query.query = 'Select id, firstname, lastname, photo from user_Sportsman';
        query.queryCount = 'Select count(*) as count from user_Sportsman';
    }
    return query;
}

module.exports.getSportsmen = getSportsmen;
