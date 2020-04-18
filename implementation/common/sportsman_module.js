const common_func = require('../commonFunc');
const constants = require("../../constants")

let numCompQuery = "(SELECT COUNT(*)\n" +
    "              FROM competition_sportsman\n" +
    "             join events_competition\n" +
    "             on competition_sportsman.idCompetition = events_competition.idCompetition\n" +
    "             join events\n" +
    "             on events_competition.idEvent = events.idEvent\n" +
    "              WHERE competition_sportsman.idSportsman = user_Sportsman.id\n" +
    "                 and date >= datefromparts(YEAR(GETDATE()), 9, 1))";

function buildConditions_forGetSportsmen(queryData, id) {
    let club = queryData.club;
    let sex = queryData.sex;
    let sportStyle = queryData.sportStyle;
    let compId = queryData.competition;
    let value = queryData.value;
    let startIndex = queryData.startIndex;
    let endIndex = queryData.endIndex;
    var conditions = [];
    var limits;

    if (id !== null && id != undefined && (queryData.competitionOperator === undefined || queryData.competitionOperator === '==')) {
        conditions.push(`sportsman_coach.idCoach = @idCoach`);
    }
    if (value !== '' && value !== undefined) {
        conditions.push("(firstname like Concat('%', @value, '%') or lastname like Concat('%', @value, '%'))");
    }
    if (sportStyle !== '' && sportStyle !== undefined) {
        conditions.push("taullo = @isTaullo");
        conditions.push("sanda = @isSanda");
    }
    if (club !== '' && club !== undefined) {
        conditions.push("sportclub like @club");
    }
    if (sex !== '' && sex !== undefined) {
        conditions.push("sex like @sex");
    }
    if (compId !== '' && compId !== undefined && queryData.competitionOperator !== undefined && queryData.competitionOperator === '==') {
        conditions.push(`idCompetition = @compId`);
    }
    if(startIndex !== '' && startIndex !== undefined && endIndex != '' && endIndex !== undefined) {
        limits = ' where rowNum >= @startIndex and rowNum <= @endIndex';
    }
    let conditionStatement = conditions.length ? ' where ' + conditions.join(' and ') : '';
    return {conditionStatement, limits};
}

function buildOrderBy_forGetSportsmen_forRowNumber(queryData) {
    let sort = queryData.sort;
    if (sort !== '' && sort !== undefined && sort === 'desc')
        return ' order by firstname desc';
    else
        return ' order by firstname';
}
function buildOrderBy_forGetSportsmen(queryData) {
    let numCompSort = queryData.numCompSort;
    console.log(numCompSort)
    let orderBy = [];
    if(numCompSort !== '' && numCompSort !== undefined) {
        if (numCompSort === 'desc')
            orderBy.push(`competitionCount desc`);
        else
            orderBy.push(`competitionCount`);
    }
    return orderBy.length > 0 ? ' order by ' + orderBy.join(', ') : '';
}

async function sportsmanProfile(id) {
    let ans = new Object();
    await dbUtils.sql(`Select user_Sportsman.id, user_Sportsman.firstname as firstname, user_Sportsman.lastname as lastname, user_Sportsman.photo, user_Sportsman.phone, user_Sportsman.email, user_Sportsman.phone, user_Sportsman.birthdate, user_Sportsman.address, sex, user_Coach.firstname as cfirstname, user_Coach.lastname clastname, name as club, taullo, sanda,sportman_files.medicalscan as medicalScan,sportman_files.insurance as insurance
                                    from user_Sportsman
                                    join sportsman_sportStyle on user_Sportsman.id = sportsman_sportStyle.id
                                    join sportsman_coach on user_Sportsman.id = sportsman_coach.idSportman
                                    join user_Coach on sportsman_coach.idCoach = user_Coach.id
                                    join sportclub on user_Sportsman.sportclub = sportclub.id
                                    left join sportman_files on sportman_files.id = @id
                                    where user_Sportsman.id = @id`)
        .parameter('id', tediousTYPES.Int, id)
        .execute()
        .then(function (results) {
            results[0].sportStyle = common_func.convertToSportStyle(results[0].taullo, results[0].sanda);
            ans.status = constants.statusCode.ok;
            ans.results = results[0]
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

async function getCategories() {
    let ans = new Object();
    await dbUtils.sql(`Select * from category order by sex, minAge`)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}
async function getSportsmanRank(sportsmanId) {
    let ans = new Object();
    await dbUtils.sql(`select avg(grade) as rank from competition_results where sportmanID = @sportsmanId`)
        .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}



module.exports.buildConditions_forGetSportsmen = buildConditions_forGetSportsmen;
module.exports.buildOrderBy_forGetSportsmen = buildOrderBy_forGetSportsmen;
module.exports.sportsmanProfile = sportsmanProfile;
module.exports.getCategories = getCategories;
module.exports.numCompQuery = numCompQuery;
module.exports.buildOrderBy_forGetSportsmen_forRowNumber = buildOrderBy_forGetSportsmen_forRowNumber;
module.exports.getSportsmanRank = getSportsmanRank;
