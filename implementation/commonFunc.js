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

function getArrayUserFromJson(row) {
    var tmp = []
    for (var key in constants.colRegisterSportsmanExcel) {
        if(key.localeCompare("idSportsman")==0){
            tmp.push(row['id'])
        }
        else if(key.localeCompare("isTaullo")==0){
            tmp.push(row['taullo'])
        }
        else if(key.localeCompare("isSanda")==0){
            tmp.push(row['sanda'])
        }
        else{
            tmp.push(row[key])
        }
    }
    return tmp;
}
/**
 *
 * @param date - yyyy/MM/dd
 * @returns {string} yyyy-mm-dd
 */
function setMysqlDateFormat(date){
    if (date != undefined && date != 'Invalid Date') {
        let initial = date.split("/");
        let objectDate=new Date(date);
        if (initial.length == 3){
            if(objectDate=='Invalid Date'){
                return 'Invalid Date'
            }
            //if(parseInt(objectDate.getFullYear()) != parseInt(initial[0]) || parseInt(objectDate.getMonth()+1)!=parseInt(initial[1]) || parseInt(objectDate.getDate())!=parseInt(initial[2])){
            //    return 'Invalid Date'
            //}
            if(new Date().getTime()>objectDate.getTime()){
                return ([objectDate.getFullYear(),objectDate.getMonth()+1,objectDate.getDate()].join('-'));
            }else{
                return 'Invalid Date'
            }
        }  
    }return 'Invalid Date'
}
function setMysqlDateFormatCoach(date){
    if (date != undefined) {
        let initial = date.split("/");
        let objectDate=new Date(date);
        if (initial.length == 3){
            if(objectDate=='Invalid Date'){
                return 'Invalid Date'
            }
            if(parseInt(objectDate.getMonth()+1)!=parseInt(initial[0]) || parseInt(objectDate.getDate())!=parseInt(initial[1])){
            //if (isNumeric(initial[2]) && isNumeric(initial[0]) && isNumeric(initial[1])){
                return 'Invalid Date'
            }
            if(new Date().getTime()>objectDate.getTime()){
                return ([objectDate.getFullYear().toString(),(objectDate.getMonth()+1).toString(),objectDate.getDate().toString()].join('-'));
            }
        }
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
    isTaullo =  isTaullo[0]
    isSanda =  isSanda[0]
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
        trans[1].commit()
}

function rollBackTrans(trans) {
    if (trans && trans[1])
        trans[1].rollback()
}

module.exports.getArrayFromJsonArray = getArrayFromJsonArray;
module.exports.getArrayFromJson = getArrayFromJson;
module.exports.getArrayUserFromJson=getArrayUserFromJson;
//module.exports.sendEmail = sendMail;
module.exports.getAgeRange = getAgeRange;
module.exports.setIsTaullo = setIsTaullo;
module.exports.setIsSanda = setIsSanda;
module.exports.convertToSportStyle = convertToSportStyle;
module.exports.sortUsers = sortUsers;
module.exports.getSessionYear = getSessionYear;
module.exports.completeIdUser = completeIdUser;
module.exports.updateTrans = updateTrans
module.exports.setMysqlDateFormat = setMysqlDateFormat
module.exports.setMysqlDateFormatCoach=setMysqlDateFormatCoach