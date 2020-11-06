const constants = require('../../constants')
const validator = require('validator');

function fixCategoryExcelData(data) {
    let regSportsman = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].length > 1) {
            if (data[i][constants.colRegisterCompetitionExcel.category1] != "" && data[i][constants.colRegisterCompetitionExcel.category1] != undefined)
                regSportsman.push({
                    id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                    category: getIdFromCategroyString(data[i][constants.colRegisterCompetitionExcel.category1])
                });
            if (data[i][constants.colRegisterCompetitionExcel.category2] != "" && data[i][constants.colRegisterCompetitionExcel.category2] != undefined)
                regSportsman.push({
                    id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                    category: getIdFromCategroyString(data[i][constants.colRegisterCompetitionExcel.category2])
                });
            if (data[i][constants.colRegisterCompetitionExcel.category3] != "" && data[i][constants.colRegisterCompetitionExcel.category3] != undefined)
                regSportsman.push({
                    id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                    category: getIdFromCategroyString(data[i][constants.colRegisterCompetitionExcel.category3])
                });
        }
    }
    return regSportsman;
}

function checkCategoryExcelData(data, categoryData) {
    let map = fixCategoryForCheck(categoryData);
    let ans = new Object();
    ans.results = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].length > 1) {
            if (data[i][constants.colRegisterCompetitionExcel.category1] != undefined && data[i][constants.colRegisterCompetitionExcel.category2] != undefined && data[i][constants.colRegisterCompetitionExcel.category1].length > 0 && (data[i][constants.colRegisterCompetitionExcel.category2].length > 0))
                if (data[i][constants.colRegisterCompetitionExcel.category1] === (data[i][constants.colRegisterCompetitionExcel.category2]))
                    ans.results.push({
                        id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                        error: constants.excelCompetitionEroorMsg.category + ' 1, ' + constants.excelCompetitionEroorMsg.category + ' 2 ' + constants.excelCompetitionEroorMsg.sameCategory
                    });
            if (data[i][constants.colRegisterCompetitionExcel.category1] != undefined && data[i][constants.colRegisterCompetitionExcel.category3] != undefined && data[i][constants.colRegisterCompetitionExcel.category1].length > 0 && (data[i][constants.colRegisterCompetitionExcel.category3].length > 0))
                if (data[i][constants.colRegisterCompetitionExcel.category1] === (data[i][constants.colRegisterCompetitionExcel.category3]))
                    ans.results.push({
                        id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                        error: constants.excelCompetitionEroorMsg.category + ' 1, ' + constants.excelCompetitionEroorMsg.category + ' 3 ' + constants.excelCompetitionEroorMsg.sameCategory
                    });
            if (data[i][constants.colRegisterCompetitionExcel.category2] != undefined && data[i][constants.colRegisterCompetitionExcel.category3] != undefined && data[i][constants.colRegisterCompetitionExcel.category2].length > 0 && (data[i][constants.colRegisterCompetitionExcel.category3].length > 0))
                if (data[i][constants.colRegisterCompetitionExcel.category2] === (data[i][constants.colRegisterCompetitionExcel.category3]))
                    ans.results.push({
                        id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                        error: constants.excelCompetitionEroorMsg.category + ' 2, ' + constants.excelCompetitionEroorMsg.category + ' 3 ' + constants.excelCompetitionEroorMsg.sameCategory
                    });

            if (data[i][constants.colRegisterCompetitionExcel.category1] != undefined && data[i][constants.colRegisterCompetitionExcel.category1].length > 0) {
                let idCategory = getIdFromCategroyString(data[i][constants.colRegisterCompetitionExcel.category1]);
                if (data[i][constants.colRegisterCompetitionExcel.sex] != map.get(idCategory).sex && map.get(idCategory).sex != 'מעורב')
                    ans.results.push({
                        id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                        error: constants.excelCompetitionEroorMsg.category + ' 1, ' + constants.excelCompetitionEroorMsg.sexFail
                    });

                let age = parseInt(data[i][constants.colRegisterCompetitionExcel.age]);
                let minAge = (parseInt(map.get(idCategory).minAge))
                let maxAge = (parseInt(map.get(idCategory).maxAge))

                if (age < minAge || age > maxAge) {
                    ans.results.push({
                        id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                        error: constants.excelCompetitionEroorMsg.category + ' 1, ' + constants.excelCompetitionEroorMsg.ageFail
                    });
                }
            }
            if (data[i][constants.colRegisterCompetitionExcel.category2] != undefined && data[i][constants.colRegisterCompetitionExcel.category2].length > 0) {
                let idCategory = getIdFromCategroyString(data[i][constants.colRegisterCompetitionExcel.category2]);
                if (data[i][constants.colRegisterCompetitionExcel.sex] != map.get(idCategory).sex && map.get(idCategory).sex != 'מעורב')
                    ans.results.push({
                        id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                        error: constants.excelCompetitionEroorMsg.category + ' 2, ' + constants.excelCompetitionEroorMsg.sexFail
                    });
                let age = parseInt(data[i][constants.colRegisterCompetitionExcel.age]);
                let minAge = (parseInt(map.get(idCategory).minAge))
                let maxAge = (parseInt(map.get(idCategory).maxAge))
                if (age < minAge || age > maxAge) {
                    ans.results.push({
                        id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                        error: constants.excelCompetitionEroorMsg.category + ' 2, ' + constants.excelCompetitionEroorMsg.ageFail
                    });
                }
                if (data[i][constants.colRegisterCompetitionExcel.category3] != undefined && data[i][constants.colRegisterCompetitionExcel.category3].length > 0) {
                    let idCategory = getIdFromCategroyString(data[i][constants.colRegisterCompetitionExcel.category3]);
                    if (data[i][constants.colRegisterCompetitionExcel.sex] != map.get(idCategory).sex && map.get(idCategory).sex != 'מעורב')
                        ans.results.push({
                            id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                            error: constants.excelCompetitionEroorMsg.category + ' 3, ' + constants.excelCompetitionEroorMsg.sexFail
                        });
                    let age = parseInt(data[i][constants.colRegisterCompetitionExcel.age]);
                    let minAge = (parseInt(map.get(idCategory).minAge))
                    let maxAge = (parseInt(map.get(idCategory).maxAge))
                    if (age < minAge || age > maxAge) {
                        ans.results.push({
                            id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
                            error: constants.excelCompetitionEroorMsg.category + ' 3, ' + constants.excelCompetitionEroorMsg.ageFail
                        });
                    }
                }
            }
        }
    }
    if (ans.results.length > 0)
        ans.pass = false;
    else
        ans.pass = true;
    return ans
}

function getIdFromCategroyString(line) {
    line = line.split(" ")[line.split(" ").length - 1];
    line = line.substring(0, line.length - 1);
    return parseInt(line)
}

function fixCategoryForCheck(data) {
    let categoryMap = new Map();
    for (let i = 0; i < data.length; i++)
        categoryMap.set(data[i].id, {
            minAge: data[i].minAge,
            maxAge: data[i].maxAge ? data[i].maxAge : 100,
            sex: data[i].sex
        });

    return categoryMap;

}

function validateDataBeforeAddCategory(newCategory) {
    let res = new Object();
    res.isPassed = true;
    let err = validateCategory(newCategory)
    if (err.length != 0) {
        res.status = Constants.statusCode.badRequest;
        res.isPassed = false;
        res.results = err;
    }
    return res;
}


function validateCategory(newCategory) {
    var err = [];
    //category Name
    if (!validator.matches(newCategory.categoryName, constants.regexHebrewAndNumbers))
        err.push(constants.errorMsg.hebErr);
    //minAge
    if (newCategory.minAge && !validator.isInt(newCategory.minAge.toString(), {min: 0, max: 100}))
        err.push(constants.errorMsg.compAgeErr);
    //maxAge
    if (newCategory.maxAge && !validator.isInt(newCategory.maxAge.toString(), {min: 0, max: 100}))
        err.push(constants.errorMsg.compAgeErr);
    //sex
    if (!(newCategory.sex in constants.sexEnumCompetition))
        err.push(constants.errorMsg.sexErr);
    //min < max
    if (newCategory.minAge > newCategory.maxAge)
        err.push(constants.errorMsg.minAgeErr);

    return err;
}


module.exports.fixCategoryExcelData = fixCategoryExcelData
module.exports.checkCategoryExcelData = checkCategoryExcelData
module.exports.validateDataBeforeAddCategory = validateDataBeforeAddCategory
