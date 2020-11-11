const constants = require("../../constants")
const dbConnection = require('../../dbUtils').dbConnection

async function addMessage(msg) {
    let ans = new Object();
    await dbConnection.query({
        sql: `insert into msg_board (msg, createDate)
                        values (:msg,:date);`,
        params: {msg: msg, date: new Date()}
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

async function editMessage(msg, msgId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `update msg_board set msg =:msg where id = :id`,
        params: {msg: msg, id: msgId}
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

async function deleteMessage(msgId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `delete from msg_board where id=:msgId`,
        params: {msgId: msgId}
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

async function getAllMsg() {
    let ans = new Object();
    await dbConnection.query({sql: `select * from msg_board`})
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

async function getMsgById(msgId) {
    let ans = new Object();
    await dbConnection.query({sql: `select * from msg_board where id = :msgId`, params: {msgId: msgId}})
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


module.exports.addMessage = addMessage
module.exports.editMessage = editMessage
module.exports.deleteMessage = deleteMessage
module.exports.getAllMsg = getAllMsg
module.exports.getMsgById = getMsgById