const constants = require("../../constants")
const dbConnection = require('../../dbUtils').dbConnection
const commonFunc = require("../commonFunc")
async function addEvent(event) {
    let ans = new Object();
    await dbConnection.query({
        sql: `insert into events (location, type, date, startHour, city) VALUES (:location, :type, :date, :startHour, :city)`,
        params: {
            location: event.location,
            type: event.type,
            date: commonFunc.setMysqlDateFormat(event.date) ,
            startHour: event.startHour,
            city: event.city
        }
    })
        .then(function (results) {
            ans.status = constants.statusCode.ok
            ans.results = results.results
        }).catch(function (err) {
            console.log(err)
            ans.results = undefined;
            ans.status = constants.statusCode.badRequest

        });
    return ans;

}

async function editEvent(event, eventId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `update events set location = :location, type = :type, date = :date, startHour = :startHour, city = :city where idEvent = :id`,
        params: {
            id: eventId,
            location: event.location,
            type: event.type,
            date: commonFunc.setMysqlDateFormat(event.date),
            startHour: event.startHour,
            city: event.city
        }
    })
        .then(function (results) {
            ans.status = constants.statusCode.ok
            ans.results = results.results
        }).catch(function (err) {
            console.log(err)
            ans.results = undefined;
            ans.status = constants.statusCode.badRequest

        });
    return ans;
}

async function deleteEvent(eventId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `delete from events where idEvent = :eventId`,
        params: {
            eventId: eventId
        }
    })
        .then(function (results) {
            ans.status = constants.statusCode.ok
            ans.results = results.results
        }).catch(function (err) {
            console.log(err)
            ans.results = undefined;
            ans.status = constants.statusCode.badRequest

        });
    return ans;
}

async function getAllEvents() {
    let ans = new Object();
    await dbConnection.query({sql: `select events.*, ec.idCompetition from events left join events_competition ec on events.idEvent = ec.idEvent where MONTH(date) >= MONTH(NOW()) order by date`})
        .then(function (results) {
            ans.status = constants.statusCode.ok
            ans.results = results.results
        }).catch(function (err) {
            console.log(err)
            ans.results = undefined;
            ans.status = constants.statusCode.badRequest

        });
    return ans;
}

async function getEventById(eventId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `select * from events left join events_competition ec on events.idEvent = ec.idEvent where events.idEvent = :eventId`,
        params: {
            eventId: eventId
        }
    })
        .then(function (results) {
            ans.status = constants.statusCode.ok
            ans.results = results.results[0]
        }).catch(function (err) {
            console.log(err)
            ans.results = undefined;
            ans.status = constants.statusCode.badRequest

        });
    return ans;
}


module.exports.addEvent = addEvent
module.exports.editEvent = editEvent
module.exports.deleteEvent = deleteEvent
module.exports.getAllEvents = getAllEvents
module.exports.getEventById = getEventById
