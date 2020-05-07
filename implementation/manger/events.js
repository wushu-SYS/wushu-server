const constants = require("../../constants")

async function addEvent() {
    let ans = new Object();
    await dbUtils.sql(``)
        .parameter('date', tediousTYPES.Date, new Date())
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
async function editEvent() {
    let ans = new Object();
    await dbUtils.sql(``)
        .parameter('id', tediousTYPES.Int, msgId)
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
    let ans = new Object();
    await dbUtils.sql(``)
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
    await dbUtils.sql(``)
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


module.exports.addEvent=addEvent
module.exports.editEvent=editEvent
module.exports.deleteEvent=deleteEvent
module.exports.getAllEvents=getAllEvents