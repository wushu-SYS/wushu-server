const constants = require('../../constants')
const validator = require('validator');
const {dbConnection} = require("../../dbUtils");

async function getCompetitions(queryData) {
    let ans = new Object();
    let query = initQuery(queryData);
    await dbConnection.query({
        sql: query.query,
        params: {
            location: queryData.location,
            sportStyle: queryData.sportStyle,
            Value0: queryData.status && queryData.status.split(',')[0] ? queryData.status.split(',')[0] : '',
            Value1: queryData.status && queryData.status.split(',')[1] ? queryData.status.split(',')[1] : '',
            Value2: queryData.status && queryData.status.split(',')[2] ? queryData.status.split(',')[2] : '',
            startIndex: queryData.startIndex-1,
            endIndex: queryData.endIndex
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results
    }).catch((error) => {
        console.log(error)
        ans.status = constants.statusCode.badRequest;
        ans.results = error;
    });
    return ans;
}

function initQuery(queryData) {
    let query = `select * from (select events_competition.idCompetition,events_competition.sportStyle ,events_competition.status,events_competition.closeRegDate, events.date from events_competition
                                   left join events on events_competition.idEvent = events.idEvent`;
    let queryCount = `select count(*) as count from events_competition 
                        left join events on events_competition.idEvent = events.idEvent`;
    let whereStatement = buildConditions_forGetCompetitions(queryData);
    query += whereStatement.conditionsStatement;
    queryCount += whereStatement.conditionsStatement;
    query += `) tmp` + whereStatement.limits;
    return {query, queryCount};
}

function buildConditions_forGetCompetitions(queryData) {
    let location = queryData.location;
    let sportStyle = queryData.sportStyle;
    let status = queryData.status;
    let startIndex = queryData.startIndex;
    let endIndex = queryData.endIndex;
    var conditions = [];
    var limits;

    if (location !== '' && location !== undefined) {
        conditions.push("(events.city like Concat('%', :location, '%') or events.location like Concat('%',  :location, '%'))");
    }
    if (sportStyle !== '' && sportStyle !== undefined) {
        conditions.push("events_competition.sportStyle like :sportStyle");
    }
    if (status !== '' && status !== undefined) {
        conditions.push("events_competition.status in (" + status.split(',').map((val, index) => `:Value${index}`).join(',') + ")");
    }
    if (startIndex !== '' && startIndex !== undefined && endIndex != '' && endIndex !== undefined) {
        // limits = ' where rowNum >= :startIndex and rowNum <= :endIndex';
        let rowCount = endIndex - startIndex + 1;
        limits = ' limit :startIndex, ' + rowCount;
    }
    let conditionsStatement = conditions.length ? ' where ' + conditions.join(' and ') : '';
    return {conditionsStatement, limits};
}

async function getCompetitionsCount(queryData) {
    let ans = new Object();
    let query = initQuery(queryData);
    await dbConnection.query({
        sql: query.queryCount,
        params: {
            location: queryData.location,
            sportStyle: queryData.sportStyle,
            Value0: queryData.status && queryData.status.split(',')[0] ? queryData.status.split(',')[0] : '',
            Value1: queryData.status && queryData.status.split(',')[1] ? queryData.status.split(',')[1] : '',
            Value2: queryData.status && queryData.status.split(',')[2] ? queryData.status.split(',')[2] : ''
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results[0]
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

function validateCompetitionDetails(eventDetails) {
    let ans = new Object();
    ans.isPassed = true;
    let err = [];
    //description
    if (!validator.matches(eventDetails.description, constants.hebRegex))
        err.push(constants.errorMsg.hebErr)
    //location
    if (!validator.matches(eventDetails.location, constants.regexHebrewAndNumbers))
        err.push(constants.errorMsg.hebErr)
    //branch
    if (!(eventDetails.sportStyle in constants.sportType))
        err.push(constants.errorMsg.sportTypeErr)
    //city
    if (!validator.matches(eventDetails.city, constants.hebRegex))
        err.push(constants.errorMsg.hebErr)

    if (err.length != 0)
        ans.isPassed = false;
    ans.results = err;
    return ans;
}

module.exports.getCompetitions = getCompetitions
module.exports.getCompetitionsCount = getCompetitionsCount
module.exports.validateCompetitionDetails = validateCompetitionDetails
