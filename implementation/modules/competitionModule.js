const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection
let commonFunc = require('../commonFunc')

async function getCompetitionDetails(compId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `select events_competition.idCompetition,events_competition.description,events_competition.sportStyle ,events_competition.status ,events_competition.closeRegDate, events_competition.closeRegTime, events.date ,events.location, events.startHour, events.city from events_competition
                                   left join events on events_competition.idEvent = events.idEvent
                                   where idCompetition= :compId`,
        params: {
            compId: compId
        }
    }).then((results) => {
        ans.status = constants.statusCode.ok;
        ans.results = results.results[0]
    }).catch((err) => {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

async function getCompetitionsToJudgeById(judgeId) {
    let ans = new Object();
    let query = `select * from events join events_competition ec on events.idEvent = ec.idEvent join competition_judge on ec.idCompetition = competition_judge.idCompetition where status like '${Constants.competitionStatus.inProgressComp}' and idJudge=:judgeId`
    await dbConnection.query({
        sql: query,
        params: {judgeId: judgeId}
    }).then(result => {
        ans.results = result.results
        ans.status = constants.statusCode.ok;
    }).catch((error) => {
        console.log(error)
        ans.status = constants.statusCode.badRequest;
        ans.results = error;
    });
    return ans
}

async function addCompetition(competitionDetails) {
    let ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    await trans.query({
        sql: ` INSERT INTO events (location,type,date,startHour,city) VALUES (:location,:eventType,:eventDate,:startHour,:city);`,
        params: {
            location: competitionDetails.location,
            eventType: constants.eventType.competition,
            eventDate: commonFunc.setMysqlDateFormat(competitionDetails.eventDate),
            startHour: competitionDetails.startHour,
            city: competitionDetails.city
        }
    // }).then(async function(){
    //     await trans.query({
    //         sql:`select last_insert_id() as lastId;`
    //     })
    }).then(async function (Result) {
        await trans.query({
            sql: ` INSERT INTO events_competition (sportStyle,description,closeRegDate,closeRegTime,status,idEvent)
                                    VALUES (:sportStyle,:description,:closeDate,:closeTime,:status,(select last_insert_id()));`,
            params: {
                sportStyle: competitionDetails.sportStyle,
                description: competitionDetails.description,
                closeDate: commonFunc.setMysqlDateFormat(competitionDetails.closeDate),
                closeTime: competitionDetails.closeTime,
                status: constants.competitionStatus.open,
                idEvent: `LAST_INSERT_ID()`
            }
        })
    }).then(async function (testResult) {
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.eventAdded;
        trans.commit();
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
        trans.rollback();
    })
    return ans;

}

async function closeRegistration(idCompetition) {
    let ans = new Object();
    await dbConnection.query({
        sql: `update events_competition set status = :status where idCompetition = :idCompetition`,
        params: {
            status: constants.competitionStatus.regClose,
            idCompetition: idCompetition
        }
    }).then((results) => {
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.closeRegistration;
    }).catch((error) => {
        console.log(error)
        ans.status = constants.statusCode.badRequest;
        ans.results = error;
    })
    return ans;
}

async function getIdEvent(idComp) {
    let res;
    await dbConnection.query({
        sql: `select idEvent from events_competition where idCompetition =:idComp;`,
        params: {
            idComp: idComp
        }
    }).then(function (results) {
        res = results.results[0].idEvent;
    }).catch(function (err) {
        console.log(err)
    });
    return res;
}

async function updateCompetitionDetails(competitionDetails, idEvent) {
    var ans = new Object();
    const trans = await dbConnection.getTransactionDb()
    await trans.query({
        sql: `Update events_competition 
                                     set sportStyle=:sportStyle,description=:description,closeRegDate=:closeRegDate,closeRegTime=:closeRegTime
                                     where idCompetition =:competitionId;`,
        params: {
            sportStyle: competitionDetails.sportStyle,
            description: competitionDetails.description,
            closeRegDate: commonFunc.setMysqlDateFormat(competitionDetails.closeRegDate),
            closeRegTime: competitionDetails.closeRegTime,
            competitionId: competitionDetails.competitionId,
        }
    }).then(async function (testResult) {
        await trans.query({
            sql: `Update events 
                                    set location =:location,type=:type,date=:eventDate,startHour=:eventTime, city=:city
                                    where idEvent =:idEvent;`,
            params: {
                idEvent: idEvent,
                location: competitionDetails.location,
                type: constants.eventType.competition,
                eventDate: commonFunc.setMysqlDateFormat(competitionDetails.eventDate),
                eventTime: competitionDetails.evetTime,
                city: competitionDetails.city
            }
        })
    }).then(async function (testResult) {
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.competitionUpdate;
        trans.commit();
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err;
        trans.rollback();
    })
    return ans;
}

async function manualCloseCompetition(idComp) {
    let ans = new Object();
    await dbConnection.sql({
        sql: `update events_competition set status = :status where idCompetition =:idComp `,
        params: {
            idComp: idComp,
            status: constants.competitionStatus.close
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

function autoCloseRegCompetition() {
    console.log('Start auto closed Register to Competition');
    dbConnection.query({
        sql: `UPDATE events_competition
                SET status='${constants.competitionStatus.close}'
                WHERE closeRegDate <= cast(convert(datetimeoffset, now(), 121) AT TIME ZONE 'Israel Standard Time' as datetime)
                 and closeRegTime <= Convert(TIME, CURRENT_TIMESTAMP)
                 and status = '${constants.competitionStatus.open}';`
    }).then(function (results) {
        console.log("Finished auto closed register to competitions")
    }).catch(function (err) {
        console.log(err)
    });
}

function autoOpenCompetitionToJudge() {
    console.log('Start auto opening competitions');
    dbConnection.query({
        sql: `update events_competition set status = '${constants.competitionStatus.inProgressComp}'
                 where events_competition.idEvent IN (SELECT events_competition.idEvent from events_competition
                 join events on events_competition.idEvent = events.idEvent
                 where (events.date = convert(Date, current_timestamp))and events.startHour <=convert(time, (convert(time,cast(convert(datetimeoffset, now(), 121) AT TIME ZONE 'Israel Standard Time' as datetime)))))`
    }).then(function (results) {
        console.log("Finished auto opening competitions")
    }).catch(function (err) {
        console.log(err)
    });
}

module.exports.getCompetitionDetails = getCompetitionDetails
module.exports.getCompetitionsToJudgeById = getCompetitionsToJudgeById
module.exports.addCompetition = addCompetition
module.exports.closeRegistration = closeRegistration
module.exports.getIdEvent = getIdEvent
module.exports.updateCompetitionDetails = updateCompetitionDetails
module.exports.manualCloseCompetition = manualCloseCompetition
module.exports.autoCloseRegCompetition = autoCloseRegCompetition
module.exports.autoOpenCompetitionToJudge = autoOpenCompetitionToJudge
