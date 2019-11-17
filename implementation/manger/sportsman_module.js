const common_sportsman_module = require('../common/sportsman_module');

function initQuery(queryData) {
    let conditions = common_sportsman_module.buildConditions_forGetSportsmen(queryData);
    let orderBy = common_sportsman_module.buildOrderBy_forGetSportsmen(queryData);
    let query = buildQuery_forGetSportsman(queryData, orderBy);
    query.query += conditions.conditionStatement;
    query.queryCount += conditions.conditionStatement;
    query.query += `) tmp` + (query.additionalData ? ` ${query.additionalData}` : '') + conditions.limits;
    return query;
}

async function getSportsmen(queryData) {
    let ans = new Object();
    let query = initQuery(queryData);
    console.log(query.query);
    await dbUtils.sql(query.query)
        .parameter('idCoach', tediousTYPES.Int, queryData.idCoach)
        .parameter('value', tediousTYPES.NVarChar, queryData.value)
        .parameter('sportStyle', tediousTYPES.NVarChar, queryData.sportStyle)
        .parameter('club', tediousTYPES.NVarChar, queryData.club)
        .parameter('sex', tediousTYPES.NVarChar, queryData.sex)
        .parameter('compId', tediousTYPES.Int, queryData.competition)
        .parameter('startIndex', tediousTYPES.NVarChar, queryData.startIndex)
        .parameter('endIndex', tediousTYPES.NVarChar, queryData.endIndex)
        .execute()
        .then(result => {
            ans.results = {
                sportsmen: result
            };
            ans.status = Constants.statusCode.ok;
        })
        .fail((error) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = error;
        });
    return ans
}
async function getSportsmenCount(queryData) {
    let ans = new Object();
    let query = initQuery(queryData);

    await dbUtils.sql(query.queryCount)
        .parameter('idCoach', tediousTYPES.Int, queryData.idCoach)
        .parameter('value', tediousTYPES.NVarChar, queryData.value)
        .parameter('sportStyle', tediousTYPES.NVarChar, queryData.sportStyle)
        .parameter('club', tediousTYPES.NVarChar, queryData.club)
        .parameter('sex', tediousTYPES.NVarChar, queryData.sex)
        .parameter('compId', tediousTYPES.Int, queryData.competition)
        .execute()
        .then(result => {
            ans.results = result[0]
            ans.status = Constants.statusCode.ok;
        })
        .fail((error) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = error;
        });
    return ans;
}

function buildQuery_forGetSportsman(queryData, orderBy) {
    let query = new Object();
    query.query = `select * from (select ROW_NUMBER() OVER (${orderBy}) AS rowNum, `;
    if (queryData.sportStyle != undefined) {
        query.query += `user_Sportsman.id, firstname, lastname, photo from user_Sportsman join sportsman_sportStyle
            on user_Sportsman.id = sportsman_sportStyle.id`;
        query.queryCount = `select count(*) as count from user_Sportsman join sportsman_sportStyle
            on user_Sportsman.id = sportsman_sportStyle.id`;
    } else if (queryData.competition !== undefined) {
        if(queryData.competitionOperator == undefined){
            query.query = `select id, firstname, lastname, photo, category, idCompetition, sex, FLOOR(DATEDIFF(DAY, birthdate, getdate()) / 365.25) as age, sportclub
                            from (
                                    select ROW_NUMBER() OVER ( order by firstname, id)             AS rowNum,
                                    *
                                    from user_Sportsman`;
            query.additionalData = `left join competition_sportsman
                    on tmp.id = competition_sportsman.idSportsman and idCompetition = @compId`;
            query.queryCount = `Select count(*) as count
                    from user_Sportsman`;
        }
        else if (queryData.competitionOperator === '==') {
            query.query += `user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman`;
            query.queryCount = `Select count(*) as count
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman`;
        } else if (queryData.competitionOperator === '!=') {
            query.query += `id, firstname, lastname, photo, sex, age, sportclub from
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
    } else {
        query.query += 'user_Sportsman.id, firstname, lastname, photo, sex, FLOOR(DATEDIFF(DAY, birthdate, getdate()) / 365.25) as age, sportclub from user_Sportsman';
        query.queryCount = 'Select count(*) as count from user_Sportsman';
    }
    return query;
}

module.exports.getSportsmen = getSportsmen;
module.exports.getSportsmenCount = getSportsmenCount;
