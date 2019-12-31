const constants = require("../../../constants")

function checkId(id) {
    if(id != null) {
        if (!(validator.isInt(id.toString()) && id.toString().length == 9))
            return constants.userError.idErr
    }
    else if("Id" in constants.sportsManMandatoryFields)
        return constants.sportsManFields.idErr
}

function checkFirstName(firstName) {
    if(firstName != null) {
        if (!(validator.matches(firstName.toString(), constants.hebRegex) && firstName.toString().length > 0))
            return constants.userError.firstNameHebErr
    }
    else if("FirstName" in constants.sportsManMandatoryFields)
        return constants.sportsManFields.firstNameErr
}

function checkLastName(lastName) {
    if(lastName != null) {
        if (!(validator.matches(lastName.toString(), constants.hebRegex) && lastName.toString().length > 0))
            return constants.userError.lastNameHebErr
    }
    else if ("LastName" in constants.sportsManMandatoryFields)
        return constants.sportsManFields.lastNameErr
}

function checkAddress(address) {
    if(address != null) {
        if (!(validator.matches(address.toString(), constants.regexHebrewAndNumbers) && address.toString().length > 0))
            return constants.userError.addressErr
    }
    else if ("Address" in constants.sportsManMandatoryFields)
        return constants.sportsManFields.addressErr
}

function checkPhone(phone) {
    if(phone != null) {
        if (!(validator.isInt(phone.toString()) && phone.toString().length != 10))
            return constants.userError.phoneErr
    }
    else if ("Phone" in constants.sportsManMandatoryFields)
        return constants.sportsManFields.phoneErr
}

function checkEmail(email) {
    if (email != null) {
        if (!validator.isEmail(email.toString()))
            return constants.userError.emailErr;
    }else if ("Email" in constants.sportsManMandatoryFields) {
            return constants.sportsManFields.emailErr
    }
}

function checkSex(sex) {
    if(sex != null) {
        if (!(sex.toString() in constants.sexEnum))
            return constants.userError.sexErr
    }
    else if ("Sex" in constants.sportsManMandatoryFields)
        return constants.sportsManFields.sexErr
}

function checkSportStyle(sportStyle) {
    if(sportStyle != null) {
        if (!(sportStyle.toString() in constants.sportType))
            return (constants.userError.sportTypeErr)
    }
    else if ("SportStyle" in constants.sportsManMandatoryFields)
        return constants.sportsManFields.sportStyleErr
}

function checkIdCoach(idCoach) {
    if(idCoach) {
        if (!(validator.isInt(id.toString()) && id.toString().length === 9))
            return constants.userError.idCoachErr
    }
    else if("IdCoach" in constants.sportsManMandatoryFields)
        return constants.sportsManFields.idCoachErr
}

function checkSportClub(sportClub) {
    if(sportClub != null) {
        if (!validator.isInt(sportClub.toString()))
            return constants.userError.sportClubErr
    }
    else if("SportClub" in constants.sportsManMandatoryFields)
        return constants.sportsManFields.sportClubErr
}

function setDateFormat(birthDate) {
    if(birthDate != null) {
        let initial = birthDate.split("/");
        return ([initial[2], initial[0], initial[1]].join('-'));
    }
    else if ("BirthDate" in constants.sportsManMandatoryFields)
        return constants.sportsManFields.birthDateErr
}


sportsManVal = {
    idVal: checkId,
    firstNameVal: checkFirstName,
    lastNameVal: checkLastName,
    setBirthDate: setDateFormat,
    addressVal: checkAddress,
    phoneVal: checkPhone,
    emailVal: checkEmail,
    sexVal: checkSex,
    sportStyleVal: checkSportStyle,
    sportClubVal: checkSportClub,
    idCoachVal: checkIdCoach
};
coachVal = {
    idVal: checkId,
    firstNameVal: checkFirstName,
    lastNameVal: checkLastName,
    addressVal: checkAddress,
    phoneVal: checkPhone,
    emailVal: checkEmail,
    sportStyleVal: checkSportStyle,
    sportClubVal: checkSportClub
};
judgeVal = {
    idVal: checkId,
    firstNameVal: checkFirstName,
    lastNameVal: checkLastName,
    phoneVal: checkPhone,
    emailVal: checkEmail
};

module.exports = {
    sportsMan: sportsManVal,
    coach: coachVal,
    judge: judgeVal
}