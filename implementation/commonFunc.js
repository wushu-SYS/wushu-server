function getArrayFromJsonArray(data) {
    var res = [];
    data.forEach(function (row) {
        res.push(getArrayFromJson(row))
    })
    return res;
}
function getArrayFromJson(row){
    var tmp = []
    for (var key in row) {
        tmp.push(row[key])
    }
    return tmp;
}

async function sendMail(sendTo, message, sub) {
    const send = require('gmail-send')({
        user: 'wushuSys@gmail.com',
        pass: 'ktrxyruavpyiqfav',
        to: sendTo,
        subject: sub
    });
    await send({
        text: message,
    }, (error, result, fullResult) => {
        if (error) console.error(error);
    })

}

function setBirthDateFormat(birthdate) {
    let initial = birthdate.split("/");
    return ([initial[1], initial[0], initial[2]].join('/'));

}


module.exports.setBirtdateFormat = setBirthDateFormat;
module.exports.getArrayFromJsonArray = getArrayFromJsonArray;
module.exports.getArrayFromJson = getArrayFromJson;
module.exports.sendEmail = sendMail;