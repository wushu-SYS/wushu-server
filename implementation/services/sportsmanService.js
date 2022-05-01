const constants = require('../../constants')
const common_func = require('../commonFunc')
const sportsmanCoachModule = require('../modules/sportsmanCoachModule')
const userValidation = require("../services/userValidations/userValidationService")
const userSportsmanModule = require("../modules/userSportsmanModule")
const {dbConnection} = require("../../dbUtils");


let numCompQuery = "(select ifnull(count(compCount), 0) as sportsmanComp from(\n" +
    "                       SELECT COUNT(*) as compCount\n" +
    "                       FROM competition_sportsman\n" +
    "                        join events_competition\n" +
    "                        on competition_sportsman.idCompetition = events_competition.idCompetition\n" +
    "                        join events\n" +
    "                        on events_competition.idEvent = events.idEvent\n" +
    "                        WHERE competition_sportsman.idSportsman = @user_Sportsman.id\n" +
    "                        and date >= STR_TO_DATE(CONCAT(:year,'-',LPAD(9,2,'00'),'-',LPAD(1,2,'00')), '%Y-%m-%d')\n" +
    "                        group by events_competition.idCompetition) as tmp)";


/**
 * getting list of sportsmen from the DB according the query data
 * :param queryData - filters to filter the result set
 * :param idCoach - whose sportsmen to return
 * :return the following json {status, results}
 */
async function getSportsmen_Coach(queryData, idCoach) {
    let ans = new Object();
    queryData.isTaullo = common_func.setIsTaullo(queryData.sportStyle);
    queryData.isSanda = common_func.setIsSanda(queryData.sportStyle);
    let query = initQuery_Coach(queryData, idCoach);
    await dbConnection.query({
        sql: query.query,
        params: {
            idCoach: idCoach,
            value: queryData.value,
            isTaullo: queryData.isTaullo,
            isSanda: queryData.isSanda,
            club: queryData.club,
            sex: queryData.sex,
            compId: queryData.competition,
            startIndex: queryData.startIndex-1,
            endIndex: queryData.endIndex,
            year: common_func.getSessionYear()
        }
    }).then(result => {
        result.results.forEach(res => {
            if (res.isTaullo && res.isSanda)
                res.sportStyle = common_func.convertToSportStyle(res.isTaullo, res.isSanda)
        });
        ans.results = {
            sportsmen: result.results
        };
        ans.status = constants.statusCode.ok;
    }).catch((err) => {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
    });
    return ans
}

function initQuery_Coach(queryData, id) {
    let conditions = buildConditions_forGetSportsmen(queryData, id);
    let mainOrderBy = buildOrderBy_forGetSportsmen_forRowNumber(queryData)
    let orderby = buildOrderBy_forGetSportsmen(queryData);
    let query = buildQuery_forGetSportsman_Coach(queryData, mainOrderBy);
    query.query += conditions.conditionStatement;
    query.queryCount += conditions.conditionStatement;
    query.query += `) tmp` + (query.additionalData ? ` ${query.additionalData}` : '') + (conditions.limits ? conditions.limits : '');
    query.query += orderby;
    return query;
}

function buildOrderBy_forGetSportsmen_forRowNumber(queryData) {
    let sort = queryData.sort;
    if (sort !== '' && sort !== undefined && sort === 'desc')
        return ' order by firstname desc';
    else
        return ' order by firstname';
}

function buildConditions_forGetSportsmen(queryData, id) {
    let club = queryData.club;
    let amuta = queryData.amuta;
    let address=queryData.address;
    let sex = queryData.sex;
    let sportStyle = queryData.sportStyle;
    let compId = queryData.competition;
    let value = queryData.value;
    let startIndex = queryData.startIndex;
    let endIndex = queryData.endIndex;
    var conditions = [];
    var limits;

    if (id !== null && id != undefined && (queryData.competitionOperator === undefined || queryData.competitionOperator === '==')) {
        conditions.push(`sportsman_coach.idCoach = :idCoach`);
    }
    if (value !== '' && value !== undefined) {
        conditions.push("(firstname like Concat('%', :value, '%') or lastname like Concat('%', :value, '%'))");
    }
    if (sportStyle !== '' && sportStyle !== undefined) {
        conditions.push("taullo = :isTaullo");
        conditions.push("sanda = :isSanda");
    }
    if (club !== '' && club !== undefined) {
        conditions.push("sportclub like :club");
    }
    if (amuta !== '' && amuta !== undefined) {
        conditions.push("amutaId like :amuta");
    }
    if (address !== '' && address !== undefined) {
        conditions.push("sportclub.address like :address");
    }
    if (sex !== '' && sex !== undefined) {
        conditions.push("sex like :sex");
    }
    if (compId !== '' && compId !== undefined && queryData.competitionOperator !== undefined && queryData.competitionOperator === '==') {
        conditions.push(`idCompetition = :compId`);
    }
    if (startIndex !== '' && startIndex !== undefined && endIndex != '' && endIndex !== undefined) {
        // limits = ' where rowNum >= :startIndex and rowNum <= :endIndex';
        let rowCount = endIndex - startIndex + 1;
        limits = ' limit :startIndex, ' + rowCount;
    }
    let conditionStatement = conditions.length ? ' where ' + conditions.join(' and ') : '';
    return {conditionStatement, limits};
}

function buildOrderBy_forGetSportsmen(queryData) {
    let numCompSort = queryData.numCompSort;
    let orderBy = [];
    if (numCompSort !== '' && numCompSort !== undefined) {
        if (numCompSort === 'desc')
            orderBy.push(`competitionCount desc`);
        else
            orderBy.push(`competitionCount`);
    }
    return orderBy.length > 0 ? ' order by ' + orderBy.join(', ') : '';
}

function buildQuery_forGetSportsman_Coach(queryData, orderBy) {
    let query = new Object();
    query.query = `select * from (select  
                    ${numCompQuery}  AS competitionCount, `;
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
    } else if (queryData.competition !== undefined) {
        if (queryData.competitionOperator == undefined) {
            query.query = `select id, firstname, lastname, photo, category, sex, FLOOR(DATEDIFF(now(), birthdate) / 365.25) as age, sportclub from(
                            Select user_Sportsman.*
                        from user_Sportsman
                        join sportsman_coach
                        on user_Sportsman.id = sportsman_coach.idSportman`;
            query.additionalData = `left join competition_sportsman
                    on tmp.id = competition_sportsman.idSportsman and idCompetition = :compId`;
            query.queryCount = `select count(*) as count from
                    (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                        from user_Sportsman
                        join sportsman_coach
                        on user_Sportsman.id = sportsman_coach.idSportman
                        where idCoach = :idCoach) as sportsman_coach`;
        } else if (queryData.competitionOperator == '==') {
            query.query += `id, firstname, lastname, photo from
                    (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                        from user_Sportsman
                        join sportsman_coach
                        on user_Sportsman.id = sportsman_coach.idSportman
                        where sportsman_coach.idCoach = :idCoach) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman`;
            query.queryCount = `select count(*) as count from
                    (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                        from user_Sportsman
                        join sportsman_coach
                        on user_Sportsman.id = sportsman_coach.idSportman
                        where idCoach = :idCoach) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman`;
        } else if (queryData.competitionOperator == '!=') {
            query.query += `id, firstname, lastname, photo, sportclub from
                (Select user_Sportsman.id, firstname, lastname, photo, sportclub
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where idCoach = :idCoach
                except
                select id, firstname, lastname,photo, sportclub from
                (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach, sportclub
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where sportsman_coach.idCoach = :idCoach) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman
                    where idCompetition = :compId) as t`;
            query.queryCount = `Select count(*) as count from
                (Select user_Sportsman.id, firstname, lastname, photo
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where idCoach = :idCoach
                except
                select id, firstname, lastname,photo from
                (Select user_Sportsman.id, firstname, lastname, photo, sportsman_coach.idCoach
                    from user_Sportsman
                    join sportsman_coach
                    on user_Sportsman.id = sportsman_coach.idSportman
                    where sportsman_coach.idCoach = :idCoach) as sportsman_coach
                    join competition_sportsman
                    on sportsman_coach.id = competition_sportsman.idSportsman
                    where idCompetition = :compId) as t`;
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


/**
 * handle getting list of sportsmen by query data filters
 * :param queryData - filters
 * :return {status, results}
 */
async function getSportsmen_Manager(queryData) {
    let ans = new Object();
    queryData.isTaullo = common_func.setIsTaullo(queryData.sportStyle);
    queryData.isSanda = common_func.setIsSanda(queryData.sportStyle);
    let query = initQuery_Manager(queryData);
    await dbConnection.query({
        sql: query.query,
        params: {
            idCoach: queryData.idCoach,
            value: queryData.value,
            isTaullo: queryData.isTaullo,
            isSanda: queryData.isSanda,
            club: queryData.club,
            amuta:queryData.amuta,
            address:queryData.address,
            sex: queryData.sex,
            compId: queryData.competition,
            startIndex: queryData.startIndex-1,
            endIndex: queryData.endIndex,
            year: common_func.getSessionYear()
        }
    }).then(result => {

        result.results.forEach(res => {
            if (res.isTaullo && res.isSanda)
                res.sportStyle = common_func.convertToSportStyle(res.isTaullo, res.isSanda)
        });
        ans.results = {
            sportsmen: result.results
        };
        ans.status = constants.statusCode.ok;
    }).catch((error) => {
        console.log(error)
        ans.status = constants.statusCode.badRequest;
        ans.results = error;
    });
    return ans
}

function initQuery_Manager(queryData) {
    let conditions = buildConditions_forGetSportsmen(queryData);
    let mainOrderBy = buildOrderBy_forGetSportsmen_forRowNumber(queryData);
    let orderBy = buildOrderBy_forGetSportsmen(queryData);
    let query = buildQuery_forGetSportsman_Manager(queryData, mainOrderBy);
    query.query += conditions.conditionStatement;
    query.queryCount += conditions.conditionStatement;
    query.query += `) tmp` + (query.additionalData ? ` ${query.additionalData}` : '') + (conditions.limits ? conditions.limits : '');
    query.query += orderBy;
    return query;
}

function buildQuery_forGetSportsman_Manager(queryData, orderBy) {
    let query = new Object();
    query.query = `select * from (select  
                    ${numCompQuery}  AS competitionCount, `;
    if (queryData.sportStyle != undefined) {
        query.query += `user_Sportsman.id, firstname, lastname, user_Sportsman.photo from user_Sportsman join sportsman_sportStyle
            on user_Sportsman.id = sportsman_sportStyle.id`;
        query.queryCount = `select count(*) as count from user_Sportsman join sportsman_sportStyle
            on user_Sportsman.id = sportsman_sportStyle.id`;
    }else if(queryData.amuta!=undefined){
        query.query += `user_Sportsman.id, firstname, lastname, user_Sportsman.photo from user_Sportsman join sportclub
            on user_Sportsman.sportclub = sportclub.id`;
        query.queryCount = `select count(*) as count from user_Sportsman join sportclub
            on user_Sportsman.sportclub = sportclub.id`;
    }else if(queryData.address!=undefined){
        query.query += `user_Sportsman.id, firstname, lastname, user_Sportsman.photo from user_Sportsman join sportclub
            on user_Sportsman.sportclub = sportclub.id`;
        query.queryCount = `select count(*) as count from user_Sportsman join sportclub
            on user_Sportsman.sportclub = sportclub.id`;
    }
    else if (queryData.competition !== undefined) {
        if (queryData.competitionOperator == undefined) {
            query.query = `select id, firstname, lastname, user_Sportsman.photo, category, idCompetition, sex, FLOOR(DATEDIFF(now(), birthdate) / 365.25) as age, sportclub
                            from (
                                    select 
                                    user_Sportsman.*
                                    from user_Sportsman`;
            query.additionalData = `left join competition_sportsman
                    on tmp.id = competition_sportsman.idSportsman and idCompetition = :compId`;
            query.queryCount = `Select count(*) as count
                    from user_Sportsman`;
        } else if (queryData.competitionOperator === '==') {
            query.query += `user_Sportsman.id, firstname, lastname, user_Sportsman.photo
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman`;
            query.queryCount = `Select count(*) as count
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman`;
        } else if (queryData.competitionOperator === '!=') {
            query.query += `id, firstname, lastname, user_Sportsman.photo, sex, age, sportclub from
                (Select user_Sportsman.id, firstname, lastname, user_Sportsman.photo, sex, FLOOR(DATEDIFF(now(), birthdate) / 365.25) as age, sportclub
                    from user_Sportsman
                except
                Select user_Sportsman.id, firstname, lastname, user_Sportsman.photo, sex, FLOOR(DATEDIFF(now(), birthdate) / 365.25) as age, sportclub
                    from user_Sportsman
                    left join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    where idCompetition = :compId) as t`;
            query.queryCount = `Select count(*) as count from
                (Select user_Sportsman.id, firstname, lastname, user_Sportsman.photo
                    from user_Sportsman
                except
                Select user_Sportsman.id, firstname, lastname, user_Sportsman.photo
                    from user_Sportsman
                    left join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    where idCompetition = :compId) as t`;
        }
    } else {
        query.query += 'user_Sportsman.id, firstname, lastname, user_Sportsman.photo, sex, FLOOR(DATEDIFF(now(), birthdate) / 365.25) as age, sportclub,user_sportsman.address,contactname,sportclub.name as sportclubName,sportclub.address as sportclubAddress,sportsman_coach.idCoach ,sportclub.amutaId,amuta.name as amutaName,taullo,sanda from user_Sportsman join sportsman_sportstyle on sportsman_sportstyle.id = user_Sportsman.id join sportclub on sportclub.id = user_Sportsman.sportclub join sportsman_coach on sportsman_coach.idSportman = user_Sportsman.id join amuta on amuta.id = sportclub.amutaId';
        query.queryCount = 'Select count(*) as count from user_Sportsman';
    }
    return query;
}

async function getAllSportsmenDetails(id) {
    let ans = new Object()
    let query = 'Select user_Sportsman.id,user_Sportsman.firstname as firstname,user_Sportsman.lastname  as lastname,user_Sportsman.phone,user_Sportsman.email,user_Sportsman.phone,user_Sportsman.birthdate,user_Sportsman.address,sex,user_Coach.id as coachId,' +
        'user_Coach.firstname as cfirstname, user_Coach.lastname  as clastname,name as club, user_Sportsman.sportclub as clubId, taullo, sanda from user_Sportsman' +
        ' join sportsman_sportStyle on user_Sportsman.id = sportsman_sportStyle.id' +
        ' join sportsman_coach on user_Sportsman.id = sportsman_coach.idSportman' +
        ' join user_Coach on sportsman_coach.idCoach = user_Coach.id' +
        ' join sportclub on user_Sportsman.sportclub = sportclub.id'
    if (id)
        query += ' where sportsman_coach.idCoach = :id'
    await dbConnection.query({
        sql: query,
        params: {
            id: id
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

/**
 * handle getting the number of sportsmen exists in db
 * :param queryData - filters to filter by
 * :return {status, results}
 */
async function getSportsmenCount_Manager(queryData) {
    let ans = new Object();
    queryData.isTaullo = common_func.setIsTaullo(queryData.sportStyle);
    queryData.isSanda = common_func.setIsSanda(queryData.sportStyle);
    let query = initQuery_Manager(queryData);

    await dbConnection.query({
        sql: query.queryCount,
        params: {
            idCoach: queryData.idCoach,
            value: queryData.value,
            isTaullo: queryData.isTaullo,
            isSanda: queryData.isSanda,
            club: queryData.club,
            amuta:queryData.amuta,
            address:queryData.address,
            sex: queryData.sex,
            compId: queryData.competition,

        }
    }).then(result => {
        ans.results = result.results[0]
        ans.status = constants.statusCode.ok;
    }).catch((error) => {
        console.log(error)
        ans.status = constants.statusCode.badRequest;
        ans.results = error;
    });
    return ans;
}


/**
 * getting the number of sportsmen exists according to the query data
 * :param queryData - filters to filter the result set
 * :param idCoach - whose sportsmen to retrieve
 * :return {status, results}
 */
async function getSportsmenCount_Coach(queryData, idCoach) {
    let ans = new Object();
    queryData.isTaullo = common_func.setIsTaullo(queryData.sportStyle);
    queryData.isSanda = common_func.setIsSanda(queryData.sportStyle);
    let query = initQuery_Coach(queryData, idCoach);

    await dbConnection.query({
        sql: query.queryCount,
        params: {
            idCoach: idCoach,
            value: queryData.value,
            isTaullo: queryData.isTaullo,
            isSanda: queryData.isSanda,
            club: queryData.club,
            sex: queryData.sex,
            compId: queryData.competition
        }
    }).then(result => {
        ans.results = result.results[0];
        ans.status = constants.statusCode.ok;
    }).catch((err) => {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
    });
    return ans;
}


async function updateProfile(data, access, id, profile) {
    let ans = new Object();
    if (await canUpdateProfile(access, id, data)) {
        let user = combineData(data, profile)
        let ans = userValidation.validateUserDetails(user, "sportsman");
        if (ans.canUpdate) {
            ans = await userSportsmanModule.updateSportsmanProfile(common_func.getArrayFromJson(ans.data));
            return ans
        }
    }
    error=ans.error
    ans = []
    ans[0] = new Object()
    ans[0].status = constants.statusCode.badRequest
    ans[0].errors = error
    return ans
}

async function canUpdateProfile(access, id, user) {
    let canEditSportsmanProfile;
    if (access === constants.userType.COACH) {
        canEditSportsmanProfile = await sportsmanCoachModule.checkIdCoachRelatedSportsman(id, user.id)
    } else if (access === constants.userType.MANAGER || id === user.id) {
        canEditSportsmanProfile = true;
    }
    return canEditSportsmanProfile
}


function combineData(data, profile) {
    let user = {
        id: data.id ? data.id : profile.id,
        firstName: data.firstName ? data.firstName : profile.firstname,
        lastName: data.lastName ? data.lastName : profile.lastname,
        phone: data.phone ? data.phone : profile.phone,
        email: data.email ? data.email : profile.email,
        birthDate: data.birthDate ? data.birthDate : (new Date(profile.birthdate)).toLocaleDateString(),
        address: data.address ? data.address : profile.address,
        sex: data.sex ? data.sex : profile.sex,
        oldId: data.oldId ? data.oldId : profile.id,
        sportStyle: data.sportStyle ? data.sportStyle : profile.sportStyle,
    }
    return user

}


module.exports.getSportsmen_Coach = getSportsmen_Coach
module.exports.getSportsmen_Manager = getSportsmen_Manager
module.exports.getAllSportsmenDetails = getAllSportsmenDetails
module.exports.getSportsmenCount_Manager = getSportsmenCount_Manager
module.exports.getSportsmenCount_Coach = getSportsmenCount_Coach
module.exports.updateProfile = updateProfile
