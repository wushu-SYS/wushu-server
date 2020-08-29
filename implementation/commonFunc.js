const constants = require('../constants')

function getArrayFromJsonArray(data) {
    var res = [];
    if (data)
        data.forEach(function (row) {
            res.push(getArrayFromJson(row))
        })
    return res;
}

function getArrayFromJson(row) {
    var tmp = []
    for (var key in row) {
        tmp.push(row[key])
    }
    return tmp;
}

/*
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

 */

function setDateFormatRegisterUser(birthDate) {
    if (birthDate != undefined) {
        let initial = birthDate.split("/");
        if (initial.length == 3)
            if (isNumeric(initial[2]) && isNumeric(initial[0]) && isNumeric(initial[1]))
                return ([initial[2], initial[0], initial[1]].join('-'));
    }
}

function getAgeRange(category) {
    if (!category || category.minAge == null)
        return undefined

    if (category.maxAge == null)
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

function convertToSportStyle(isTaullo, isSanda) {
    if (isTaullo == true && isSanda == false)
        return constants.sportStyle.taullo;
    else if (isTaullo == false && isSanda == true)
        return constants.sportStyle.sanda;
    else if (isTaullo == true && isSanda == true)
        return constants.sportStyle.both;
}

function sortUsers(users) {
    let resultJson = [];
    // users.sort(
    //     function (obj1, obj2) {
    //         let x = obj1.category ? obj1.category : Number.NEGATIVE_INFINITY;
    //         let y = obj2.category ? obj2.category : Number.NEGATIVE_INFINITY;
    //         return x - y;
    //     });
    if (users) {
        let usedCategories = Array.from(new Set(users.map(u => u.category))).map(id => {
            let currUser = users.find(u => u.category === id);
            return {
                id: id,
                name: currUser.categoryName,
                minAge: currUser.minAge,
                maxAge: currUser.maxAge,
                sex: currUser.categorySex
            };
        });
        let i = 0;
        usedCategories.forEach(category => {
            resultJson.push({
                category: category,
                users: users.filter(u => u.category == category.id)
            });
        });
    }
    return resultJson;
}

function getSessionYear() {
    let year = new Date().getFullYear();
    if (new Date().getMonth() < constants.monthDateFromZERO.SEPTEMBER)
        year = year - 1;

    return year
}

function isNumeric(value) {
    return /^-{0,1}\d+$/.test(value);
}

function completeIdUser(id) {
    return ("000000000" + id).slice(-9);
}

function updateTrans(canUpdate, transA, transB, transC) {
    if (canUpdate) {
        commitTrans(transA)
        commitTrans(transB)
        commitTrans(transC)
    } else {
        rollBackTrans(transA)
        rollBackTrans(transB)
        rollBackTrans(transC)
    }
}


function commitTrans(trans) {
    if (trans && trans[1])
        trans[1].commitTransaction()
}

function rollBackTrans(trans) {
    if (trans && trans[1])
        trans[1].rollbackTransaction()
}

module.exports.setDateFormatRegisterUser = setDateFormatRegisterUser;
module.exports.getArrayFromJsonArray = getArrayFromJsonArray;
module.exports.getArrayFromJson = getArrayFromJson;
//module.exports.sendEmail = sendMail;
module.exports.getAgeRange = getAgeRange;
module.exports.setIsTaullo = setIsTaullo;
module.exports.setIsSanda = setIsSanda;
module.exports.convertToSportStyle = convertToSportStyle;
module.exports.sortUsers = sortUsers;
module.exports.getSessionYear = getSessionYear;
module.exports.completeIdUser = completeIdUser;
module.exports.updateTrans = updateTrans