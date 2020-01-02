const userValidation = require("../userValidations/usersValidations");
const constants = require("../../../constants")

function sportsManExcelValidations(user) {
    let errList = [];
    pushErrorsToList(errList,userValidation.sportsman.idVal(user[constants.colRegisterSportsmanExcel.idSportsman]));
    pushErrorsToList(errList,userValidation.sportsman.firstNameVal(user[constants.colRegisterSportsmanExcel.firstName]));
    pushErrorsToList(errList,userValidation.sportsman.lastNameVal(user[constants.colRegisterSportsmanExcel.lastName]));
    pushErrorsToList(errList,userValidation.sportsman.phoneVal(user[constants.colRegisterSportsmanExcel.phone]));
    pushErrorsToList(errList,userValidation.sportsman.addressVal(user[constants.colRegisterSportsmanExcel.address]));
    pushErrorsToList(errList,userValidation.sportsman.emailVal(user[constants.colRegisterSportsmanExcel.email]));
    pushErrorsToList(errList,userValidation.sportsman.setBirthDate(user[constants.colRegisterSportsmanExcel.birthDate]));
    pushErrorsToList(errList,userValidation.sportsman.sexVal(user[constants.colRegisterSportsmanExcel.sex]));
    pushErrorsToList(errList,userValidation.sportsman.sportStyleVal(user[constants.colRegisterSportsmanExcel.sportStyle]));
    pushErrorsToList(errList,userValidation.sportsman.sportClubVal(user[constants.colRegisterSportsmanExcel.sportClub]));
    pushErrorsToList(errList,userValidation.sportsman.idCoachVal(user[constants.colRegisterSportsmanExcel.idCoach]));

    return errList
}

function sportsmanManualValidations(user) {
    let errList = [];
    pushErrorsToList(errList,userValidation.sportsman.idVal(user.id));
    pushErrorsToList(errList,userValidation.sportsman.firstNameVal(user.firstName));
    pushErrorsToList(errList,userValidation.sportsman.lastNameVal(user.lastName));
    pushErrorsToList(errList,userValidation.sportsman.phoneVal(user.phone));
    pushErrorsToList(errList,userValidation.sportsman.addressVal(user.address));
    pushErrorsToList(errList,userValidation.sportsman.emailVal(user.email));
    pushErrorsToList(errList,userValidation.sportsman.setBirthDate(user.birthDate));
    pushErrorsToList(errList,userValidation.sportsman.sexVal(user.sex));
    pushErrorsToList(errList,userValidation.sportsman.sportStyleVal(user.sportStyle));
    pushErrorsToList(errList,userValidation.sportsman.sportClubVal(user.sportClub));
    pushErrorsToList(errList,userValidation.sportsman.idCoachVal(user.idCoach));

    return errList
}
function pushErrorsToList(errList,err){
    if (err!=undefined)
        errList.push(err)
}

module.exports.sportsManExcelValidations=sportsManExcelValidations;
module.exports.sportsmanManualValidations=sportsmanManualValidations;