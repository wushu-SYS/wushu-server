const userValidation = require("../userValidations/usersValidations");

function sportsManValidations(user) {
    let errList = {};
    errList.push(userValidation.sportsMan.idVal());
    errList.push(userValidation.sportsMan.firstNameVal());
    errList.push(userValidation.sportsMan.lastNameVal());
    errList.push(userValidation.sportsMan.phoneVal());
    errList.push(userValidation.sportsMan.addressVal());
    errList.push(userValidation.sportsMan.emailVal());
    errList.push(userValidation.sportsMan.setBirthDate());
    errList.push(userValidation.sportsMan.sexVal());
    errList.push(userValidation.sportsMan.sportStyleVal());
    errList.push(userValidation.sportsMan.sportClubVal());
    errList.push(userValidation.sportsMan.idCoachVal());
}