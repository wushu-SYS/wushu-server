function getArrayFromJson(data) {
    var res = [];
    data.forEach(function (row) {
        var tmp = []
        for (var key in row) {
            tmp.push(row[key])
        }
        res.push(tmp)
    })
    return res;
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
        console.log(result);
    })

}

function setBirthDateFormat(birthdate) {
    var initial = birthdate.split("/");
    return ([initial[1], initial[0], initial[2]].join('/'));

}


module.exports.setBirtdateFormat = setBirthDateFormat;
module.exports.getArrayFromJson = getArrayFromJson;
module.exports.sendEmail = sendMail;