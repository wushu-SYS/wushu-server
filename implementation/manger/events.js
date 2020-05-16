const constants = require("../../constants")

async function addEvent(event) {
    let ans = new Object();
    await dbUtils.sql(`insert into events (location, type, date, startHour, city) VALUES (@location, @type, @date, @startHour, @city)`)
        .parameter('location', tediousTYPES.NVarChar, event.location)
        .parameter('type', tediousTYPES.NVarChar, event.type)
        .parameter('date', tediousTYPES.NVarChar, event.date)
        .parameter('startHour', tediousTYPES.NVarChar, event.startHour)
        .parameter('city', tediousTYPES.NVarChar, event.city)
        .execute()
        .then(function (results) {
            ans.status =constants.statusCode.ok
            ans.results = results
        }).fail(function (err) {
            console.log(err)
            ans.results = undefined;
            ans.status = constants.statusCode.badRequest

        });
    return ans;

}
async function editEvent(event, eventId) {
    let ans = new Object();
    await dbUtils.sql(`update events set location = @location, type = @type, date = @date, startHour = @startHour, city = @city where idEvent = @id`)
        .parameter('id', tediousTYPES.Int, eventId)
        .parameter('location', tediousTYPES.NVarChar, event.location)
        .parameter('type', tediousTYPES.NVarChar, event.type)
        .parameter('date', tediousTYPES.NVarChar, event.date)
        .parameter('startHour', tediousTYPES.NVarChar, event.startHour)
        .parameter('city', tediousTYPES.NVarChar, event.city)
        .execute()
        .then(function (results) {
            ans.status =constants.statusCode.ok
            ans.results = results
        }).fail(function (err) {
            console.log(err)
            ans.results = undefined;
            ans.status = constants.statusCode.badRequest

        });
    return ans;
}
async function deleteEvent(eventId) {
    console.log(eventId)
    let ans = new Object();
    await dbUtils.sql(`delete from events where idEvent = @eventId`)
        .parameter('eventId', tediousTYPES.Int, eventId)
        .execute()
        .then(function (results) {
            ans.status =constants.statusCode.ok
            ans.results = results
        }).fail(function (err) {
            console.log(err)
            ans.results = undefined;
            ans.status = constants.statusCode.badRequest

        });
    return ans;
}
async function getAllEvents() {
    let ans = new Object();
    await dbUtils.sql(`select events.*, ec.idCompetition from events left join events_competition ec on events.idEvent = ec.idEvent where MONTH(date) >= MONTH(GETDATE())`)
        .execute()
        .then(function (results) {
            ans.status =constants.statusCode.ok
            ans.results = results
        }).fail(function (err) {
            console.log(err)
            ans.results = undefined;
            ans.status = constants.statusCode.badRequest

        });
    return ans;
}
async function getEventById(eventId) {
    let ans = new Object();
    await dbUtils.sql(`select * from events left join events_competition ec on events.idEvent = ec.idEvent where events.idEvent = @eventId`)
        .parameter('eventId', tediousTYPES.Int, eventId)
        .execute()
        .then(function (results) {
            ans.status =constants.statusCode.ok
            ans.results = results[0]
        }).fail(function (err) {
            console.log(err)
            ans.results = undefined;
            ans.status = constants.statusCode.badRequest

        });
    return ans;
}


module.exports.addEvent=addEvent
module.exports.editEvent=editEvent
module.exports.deleteEvent=deleteEvent
module.exports.getAllEvents=getAllEvents
module.exports.getEventById=getEventById
