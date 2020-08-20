const common_sportsman_module = require('../common/sportsman_module');
const common_func = require('../commonFunc');

function initQuery(queryData, id) {
    let conditions = common_sportsman_module.buildConditions_forGetSportsmen(queryData, id);
    let mainOrderBy = common_sportsman_module.buildOrderBy_forGetSportsmen_forRowNumber(queryData)
    let orderby = common_sportsman_module.buildOrderBy_forGetSportsmen(queryData);
    let query = buildQuery_forGetSportsman(queryData, mainOrderBy);
    query.query += conditions.conditionStatement;
    query.queryCount += conditions.conditionStatement;
    query.query += `) tmp` + (query.additionalData ? ` ${query.additionalData}` : '') + (conditions.limits ? conditions.limits : '');
    query.query += orderby;
    return query;
}

/**
 * getting list of sportsmen from the DB according the query data
 * @param queryData - filters to filter the result set
 * @param idCoach - whose sportsmen to return
 * @return the following json {status, results}
 */
async function getSportsmen(queryData, idCoach) {
    let ans = new Object();
    queryData.isTaullo = common_func.setIsTaullo(queryData.sportStyle);
    queryData.isSanda = common_func.setIsSanda(queryData.sportStyle);
    let query = initQuery(queryData, idCoach);
    await dbUtils.sql(query.query)
        .parameter('idCoach', tediousTYPES.Int, idCoach)
        .parameter('value', tediousTYPES.NVarChar, queryData.value)
        .parameter('isTaullo', tediousTYPES.Bit, queryData.isTaullo)
        .parameter('isSanda', tediousTYPES.Bit, queryData.isSanda)
        .parameter('club', tediousTYPES.NVarChar, queryData.club)
        .parameter('sex', tediousTYPES.NVarChar, queryData.sex)
        .parameter('compId', tediousTYPES.Int, queryData.competition)
        .parameter('startIndex', tediousTYPES.NVarChar, queryData.startIndex)
        .parameter('endIndex', tediousTYPES.NVarChar, queryData.endIndex)
        .parameter('year', tediousTYPES.Int, common_func.getSessionYear())
        .execute()
        .then(result => {
            result.forEach(res => res.sportStyle = common_func.convertToSportStyle(res.isTaullo, res.isSanda));
            ans.results = {
                sportsmen: result
            };
            ans.status = Constants.statusCode.ok;
        })
        .fail((err) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans
}

/**
 * getting the number of sportsmen exists according to the query data
 * @param queryData - filters to filter the result set
 * @param idCoach - whose sportsmen to retrieve
 * @return {status, results}
 */
async function getSportsmenCount(queryData, idCoach) {
    let ans = new Object();
    queryData.isTaullo = common_func.setIsTaullo(queryData.sportStyle);
    queryData.isSanda = common_func.setIsSanda(queryData.sportStyle);
    let query = initQuery(queryData, idCoach);

    await dbUtils.sql(query.queryCount)
        .parameter('idCoach', tediousTYPES.Int, idCoach)
        .parameter('value', tediousTYPES.NVarChar, queryData.value)
        .parameter('isTaullo', tediousTYPES.Bit, queryData.isTaullo)
        .parameter('isSanda', tediousTYPES.Bit, queryData.isSanda)
        .parameter('club', tediousTYPES.NVarChar, queryData.club)
        .parameter('sex', tediousTYPES.NVarChar, queryData.sex)
        .parameter('compId', tediousTYPES.Int, queryData.competition)
        .execute()
        .then(result => {
            ans.results = result[0];
            ans.status = Constants.statusCode.ok;
        })
        .fail((err) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

function buildQuery_forGetSportsman(queryData, orderBy) {
    let query = new Object();
    query.query = `select * from (select ROW_NUMBER() OVER (${orderBy}) AS rowNum, 
                    ${common_sportsman_module.numCompQuery}  AS competitionCount, `;
    if (queryData.sportStyle !== undefined) {
        query.query += `user_Sportsman.id,firstname,lastname,photo
                    from user_Sportsman
                    join sportsman_sportStyle
                    on user_Sportsman.id = sportsman_sportStyle.id
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman`;
        query.queryCount = `Select count(*) as count
                    from user_Sportsman
                    join sportsman_sportStyle
                    on user_Sportsman.id = sportsman_sportStyle.id
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman`;
    } else if (queryData.competition !== undefined ) {
        if(queryData.competitionOperator == undefined){
            query.query = `select id, firstname, lastname, photo, category, sex, FLOOR(DATEDIFF(DAY, birthdate, getdate()) / 365.25) as age, sportclub from(
                            Select ROW_NUMBER() OVER ( order by firstname, id) AS rowNum, *
                        from user_Sportsman
                        join sportsman_coach
                        on user_Sportsman.id = sportsman_coach.idSportman`;
            query.additionalData = `left join competition_sportsman
                    on tmp.id = competition_sportsman.idSportsman and idCompetition = @compId`;
            query.queryCount = `select count(*) as count from
                    (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                        from user_Sportsman
                        join sportsman_coach
                        on user_Sportsman.id = sportsman_coach.idSportman
                        where idCoach = @idCoach) as sportsman_coach`;
        }
        else if (queryData.competitionOperator == '==') {
            query.query += `id, firstname, lastname, photo from
                    (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                        from user_Sportsman
                        join sportsman_coach
                        on user_Sportsman.id = sportsman_coach.idSportman
                        where sportsman_coach.idCoach = @idCoach) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman`;
            query.queryCount = `select count(*) as count from
                    (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                        from user_Sportsman
                        join sportsman_coach
                        on user_Sportsman.id = sportsman_coach.idSportman
                        where idCoach = @idCoach) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman`;
        } else if (queryData.competitionOperator == '!=') {
            query.query += `id, firstname, lastname, photo, sportclub from
                (Select user_Sportsman.id, firstname, lastname, photo, sportclub
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where idCoach = @idCoach
                except
                select id, firstname, lastname,photo, sportclub from
                (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach, sportclub
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where sportsman_coach.idCoach = @idCoach) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman
                    where idCompetition = @compId) as t`;
            query.queryCount = `Select count(*) as count from
                (Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where idCoach = @idCoach
                except
                select id, firstname, lastname,photo from
                (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where sportsman_coach.idCoach = @idCoach) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman
                    where idCompetition = @compId) as t`;
        }
    } else {
        query.query += `id,firstname,lastname,photo
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman`;
        query.queryCount = `Select count(*) as count
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman`;
    }
    return query;
}

async function updateMedicalScanDB(path, id){
    let sql = `INSERT INTO sportman_files (id, medicalscan) VALUES (@id,@medicalScan)`;
    if(await checkIfNeedUpdate(id))
        sql =`UPDATE sportman_files SET medicalscan = @medicalScan Where id= @id`
    let ans = new Object();
    await dbUtils.sql(sql)
        .parameter('id', tediousTYPES.Int, id)
        .parameter('medicalScan', tediousTYPES.NVarChar, path)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = "upload"

        }).fail(function (err) {
            console.log(err)
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}
async function updateHealthInsuranceDB(path, id){
    let sql = `INSERT INTO sportman_files (id, insurance) VALUES (@id,@insurance)`;
    if(await checkIfNeedUpdate(id))
        sql =`UPDATE sportman_files SET insurance = @insurance Where id= @id`;
    let ans = new Object();
    await dbUtils.sql(sql)
        .parameter('id', tediousTYPES.Int, id)
        .parameter('insurance', tediousTYPES.NVarChar, path)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = "upload"

        }).fail(function (err) {
            console.log(err)
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

async function checkIfNeedUpdate(id){
    let sql = `SELECT * FROM sportman_files WHERE id = @id`
    let result =false
    await dbUtils.sql(sql)
        .parameter('id', tediousTYPES.Int, id)
        .execute()
        .then(function (results) {
            if (results.length!=0)
                result= true

        }).fail(function (err) {
            console.log(err)
        });
    return result
}

module.exports.getSportsmen = getSportsmen;
module.exports.getSportsmenCount = getSportsmenCount;
module.exports.updateMedicalScanDB = updateMedicalScanDB;
module.exports.updateHealthInsuranceDB = updateHealthInsuranceDB;

