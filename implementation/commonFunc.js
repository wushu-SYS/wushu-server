const constants = require('../constants')

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

function setDateFormatRegisterUser(birthDate) {
    if (birthDate != undefined) {
        let initial = birthDate.split("/");
        return ([initial[2], initial[0], initial[1]].join('-'));
    }
}

function getAgeRange(category){
    if(category.maxAge == null)
        return category.minAge != 0 ? category.minAge + "+" : "";
    else
        return category.minAge + "-" + category.maxAge;
}

function setIsTaullo(sportStyle) {
    switch (sportStyle) {
        case constants.sportStyle.taullo :
            return 1;
        case constants.sportStyle.sanda :
            return 0;
        case constants.sportStyle.both :
            return 1;
    }
}

function setIsSanda(sportStyle) {
    switch (sportStyle) {
        case constants.sportStyle.taullo :
            return 0;
        case constants.sportStyle.sanda :
            return 1;
        case constants.sportStyle.both :
            return 1;
    }
}

function convertToSportStyle(isTaullo, isSanda){
    if(isTaullo && !isSanda)
        return constants.sportStyle.taullo;
    else if(!isTaullo && isSanda)
        return constants.sportStyle.sanda;
    else if(isTaullo && isSanda)
        return constants.sportStyle.both;
}



module.exports.setDateFormatRegisterUser = setDateFormatRegisterUser;
module.exports.getArrayFromJsonArray = getArrayFromJsonArray;
module.exports.getArrayFromJson = getArrayFromJson;
module.exports.sendEmail = sendMail;
module.exports.getAgeRange = getAgeRange;
module.exports.setIsTaullo = setIsTaullo;
module.exports.setIsSanda = setIsSanda;
module.exports.convertToSportStyle = convertToSportStyle;
