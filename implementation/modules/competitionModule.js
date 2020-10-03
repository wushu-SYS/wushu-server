const constants = require('../../constants')

async function getCompetitionDetails(compId) {
    let ans = new Object();
    await dbUtils.sql(`select events_competition.idCompetition,events_competition.description,events_competition.sportStyle ,events_competition.status ,events_competition.closeRegDate, events_competition.closeRegTime, events.date ,events.location, events.startHour, events.city from events_competition
                                   left join events on events_competition.idEvent = events.idEvent
                                   where idCompetition= @compId`)
        .parameter('compId', tediousTYPES.Int, compId)
        .execute()
        .then((results) => {
            ans.status = constants.statusCode.ok;
            ans.results = results[0]
        })
        .fail((err) => {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}
async function getCompetitionsToJudgeById(judgeId) {
    let ans = new Object();
    let query = `select * from events join events_competition ec on events.idEvent = ec.idEvent join competition_judge on ec.idCompetition = competition_judge.idCompetition where status like '${Constants.competitionStatus.inProgressComp}' and idJudge=@judgeId`
    await dbUtils.sql(query)
        .parameter('judgeId', tediousTYPES.Int, judgeId)
        .execute()
        .then(result => {
            ans.results = result
            ans.status = constants.statusCode.ok;
        })
        .fail((error) => {
            ans.status = constants.statusCode.badRequest;
            ans.results = error;
        });
    return ans
}
async function addCompetition(competitionDetails) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(` INSERT INTO events (location,type,date,startHour,city)
                                     output inserted.idEvent
                                    VALUES (@location,@eventType,@eventDate,@startHour,@city);`)
                .parameter('location', tediousTYPES.NVarChar, competitionDetails.location)
                .parameter('eventType', tediousTYPES.NVarChar, constants.eventType.competition)
                .parameter('eventDate', tediousTYPES.NVarChar, competitionDetails.eventDate)
                .parameter('startHour', tediousTYPES.NVarChar, competitionDetails.startHour)
                .parameter('city', tediousTYPES.NVarChar, competitionDetails.city)
                .execute();
        })
        .then(async function (Result) {
            return await trans.sql(` INSERT INTO events_competition (sportStyle,description,closeRegDate,closeRegTime,status,idEvent)
                                    VALUES (@sportStyle,@description,@closeDate,@closeTime,@status,@idEvent);`)
                .parameter('sportStyle', tediousTYPES.NVarChar, competitionDetails.sportStyle)
                .parameter('description', tediousTYPES.NVarChar, competitionDetails.description)
                .parameter('closeDate', tediousTYPES.NVarChar, competitionDetails.closeDate)
                .parameter('closeTime', tediousTYPES.NVarChar, competitionDetails.closeTime)
                .parameter('status', tediousTYPES.NVarChar, constants.competitionStatus.open)
                .parameter('idEvent', tediousTYPES.Int, Result[0].idEvent)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.eventAdded;
            trans.commitTransaction();
        })
        .fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans;

}

async function closeRegistration(idCompetition) {
    let ans = new Object();
    await dbUtils.sql(`update events_competition set status = @status where idCompetition = @idCompetition`)
        .parameter('status', tediousTYPES.NVarChar, constants.competitionStatus.regclose)
        .parameter('idCompetition', tediousTYPES.Int, idCompetition)
        .execute()
        .then((results) => {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.closeRegistration;
        })
        .fail((error) => {
            ans.status = constants.statusCode.badRequest;
            ans.results = error;
        })
    return ans;
}
async function getIdEvent(idComp) {
    let res;
    await dbUtils.sql(`select idEvent from events_competition where idCompetition =@idComp;`)
        .parameter('idComp', tediousTYPES.Int, idComp)
        .execute()
        .then(function (results) {
            res = results[0].idEvent;
        }).fail(function (err) {
            console.log(err)
        });
    return res;
}

async function updateCompetitionDetails(competitionDetails, idEvent) {
    var ans = new Object();
    var trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`Update events_competition 
                                     set sportStyle=@sportStyle,description=@description,closeRegDate=@closeRegDate,closeRegTime=@closeRegTime
                                     where idCompetition =@competitionId;`)
                .parameter('sportStyle', tediousTYPES.NVarChar, competitionDetails.sportStyle)
                .parameter('description', tediousTYPES.NVarChar, competitionDetails.description)
                .parameter('closeRegDate', tediousTYPES.NVarChar, competitionDetails.closeRegDate)
                .parameter('closeRegTime', tediousTYPES.NVarChar, competitionDetails.closeRegTime)
                .parameter('competitionId', tediousTYPES.Int, competitionDetails.competitionId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`Update events 
                                    set location =@location,type=@type,date=@eventDate,startHour=@evetTime, city=@city
                                    where idEvent =@idEvent;`)
                .parameter('idEvent', tediousTYPES.Int, idEvent)
                .parameter('location', tediousTYPES.NVarChar, competitionDetails.location)
                .parameter('type', tediousTYPES.NVarChar, constants.eventType.competition)
                .parameter('eventDate', tediousTYPES.NVarChar, competitionDetails.eventDate)
                .parameter('evetTime', tediousTYPES.NVarChar, competitionDetails.evetTime)
                .parameter('city', tediousTYPES.NVarChar, competitionDetails.city)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.competitionUpdate;
            trans.commitTransaction();
        })
        .fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans;
}

async function manualCloseCompetition(idComp) {
    let ans = new Object();
    await dbUtils.sql(`update events_competition set status = @status where idCompetition =@idComp `)
        .parameter('idComp', tediousTYPES.Int, idComp)
        .parameter('status', tediousTYPES.NVarChar, constants.competitionStatus.close)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}
function autoCloseRegCompetition() {
    console.log('Start auto closed Register to Competition');
    dbUtils.sql(`UPDATE events_competition
                SET status='${constants.competitionStatus.close}'
                WHERE closeRegDate <= cast(convert(datetimeoffset, GETDATE(), 121) AT TIME ZONE 'Israel Standard Time' as datetime)
                 and closeRegTime <= Convert(TIME, CURRENT_TIMESTAMP)
                 and status = '${constants.competitionStatus.open}';`)
        .execute()
        .then(function (results) {
            console.log("Finished auto closed register to competitions")
        }).fail(function (err) {
        console.log(err)
    });
}

function autoOpenCompetitionToJudge() {
    console.log('Start auto closed Register to Competition');
    dbUtils.sql(`update events_competition set status = '${constants.competitionStatus.inProgressComp}'
                 where events_competition.idEvent IN (SELECT events_competition.idEvent from events_competition
                 join events on events_competition.idEvent = events.idEvent
                 where (events.date = convert(Date, current_timestamp))and events.startHour <=convert(time, (convert(time,cast(convert(datetimeoffset, GETDATE(), 121) AT TIME ZONE 'Israel Standard Time' as datetime)))))`)
        .execute()
        .then(function (results) {
            console.log("Finished auto closed register to competitions")
        }).fail(function (err) {
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