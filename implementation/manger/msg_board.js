const constants = require("../../constants")

async function addMessage(msg) {
    let ans = new Object();
    await dbUtils.sql(`insert into msg_board (msg, createDate)
                        values (@msg,@date);`)
        .parameter('msg', tediousTYPES.Text, msg)
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
async function editMessage(msg,msgId) {
    let ans = new Object();
    await dbUtils.sql(`update msg_board set msg =@msg where id = @id`)
        .parameter('msg', tediousTYPES.Text, msg)
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
async function deleteMessage(msgId) {
    let ans = new Object();
    await dbUtils.sql(`delete from msg_board where id=@msgId`)
        .parameter('msgId', tediousTYPES.Int, msgId)
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
async function getAllMsg() {
    let ans = new Object();
    await dbUtils.sql(`select * from msg_board`)
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

async function getMsgById(msgId) {
    let ans = new Object();
    await dbUtils.sql(`select * from msg_board where id = @msgId`)
        .parameter('msgId', tediousTYPES.Int, msgId)
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


module.exports.addMessage=addMessage
module.exports.editMessage=editMessage
module.exports.deleteMessage=deleteMessage
module.exports.getAllMsg=getAllMsg
module.exports.getMsgById=getMsgById