/**
 * validate user's fields
 */
const constants = require("../../../constants")
const validator =require('validator')


function checkId(id) {
    if (id != null) {
        if (!(validator.isInt(id.toString()) && id.toString().length == 9))
            return constants.userError.idErr
    } else
        return constants.sportsManFields.idErr
}

function checkFirstName(firstName) {
    if (firstName != null) {
        if (!(validator.matches(firstName.toString(), constants.constRegex.regexHeb) && firstName.toString().length > 0))
            return constants.userError.firstNameHebErr
    } else
        return constants.sportsManFields.firstNameErr
}

function checkLastName(lastName) {
    if (lastName != null) {
        if (!(validator.matches(lastName.toString(), constants.constRegex.regexHeb) && lastName.toString().length > 0))
            return constants.userError.lastNameHebErr
    } else
        return constants.sportsManFields.lastNameErr
}

function checkAddress(address, userType) {
    if (address != null) {
        if (!(validator.matches(address.toString(), constants.constRegex.regexHebrewAndNumbers) && address.toString().length > 0))
            return constants.userError.addressErr
    } else switch (userType) {
        case constants.userType.sportsman :
            if (constants.sportsManMandatoryFields.includes("Address"))
                return constants.sportsManFields.addressErr
        default:
            return constants.sportsManFields.addressErr
    }
}

function checkPhone(phone, userType) {
    if (phone != null) {
        if (!(validator.isInt(phone.toString()) && phone.toString().length === 10))
            return constants.userError.phoneErr
    } else switch (userType) {
        case constants.userType.sportsman :
            if (constants.sportsManMandatoryFields.includes("Phone"))
                return constants.sportsManFields.phoneErr
        default:
            return constants.sportsManFields.phoneErr
    }
}

function checkEmail(email, userType) {
    if (email != null) {
        if (!validator.isEmail(email.toString()))
            return constants.userError.emailErr;
    } else switch (userType) {
        case constants.userType.sportsman :
            if (constants.sportsManMandatoryFields.includes("Email"))
                return constants.sportsManFields.emailErr
        default:
            return constants.sportsManFields.emailErr
    }
}

function checkSex(sex) {
    if (sex != null) {
        if (!(sex.toString() in constants.sexEnum))
            return constants.userError.sexErr
    } else if (constants.sportsManMandatoryFields.includes("Sex"))
        return constants.sportsManFields.sexErr
}

function checkSportStyle(sportStyle) {
    if (sportStyle != null) {
        if (!(sportStyle.toString() in constants.sportType))
            return (constants.userError.sportTypeErr)
    } else if (constants.sportsManMandatoryFields.includes("SportStyle"))
        return constants.sportsManFields.sportStyleErr
}

function checkIdCoach(idCoach) {
    if (idCoach != null) {
        if (!(validator.isInt(idCoach.toString()) && idCoach.toString().length === 9))
            return constants.userError.idCoachErr
    } else if (constants.sportsManMandatoryFields.includes("IdCoach"))
        return constants.sportsManFields.idCoachErr
}

function checkSportClub(sportClub) {
    if (sportClub != null) {
        if (!validator.isInt(sportClub.toString()))
            return constants.userError.sportClubErr
    } else if (constants.sportsManMandatoryFields.includes("SportClub"))
        return constants.sportsManFields.sportClubErr

}

function checkDate(birthDate) {
    if (birthDate == null)
        if (constants.sportsManMandatoryFields.includes("BirthDate"))
            return constants.sportsManFields.birthDateErr
}

/**
 * needed validates for sportsman
 */
sportsmanVal = {
    idVal: checkId,
    firstNameVal: checkFirstName,
    lastNameVal: checkLastName,
    setBirthDate: checkDate,
    addressVal: checkAddress,
    phoneVal: checkPhone,
    emailVal: checkEmail,
    sexVal: checkSex,
    sportStyleVal: checkSportStyle,
    sportClubVal: checkSportClub,
    idCoachVal: checkIdCoach
};
/**
 * needed validates for coach
 */
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
/**
 * needed validates for judge
 */
judgeVal = {
    idVal: checkId,
    firstNameVal: checkFirstName,
    lastNameVal: checkLastName,
    phoneVal: checkPhone,
    emailVal: checkEmail
};

module.exports = {
    sportsman: sportsmanVal,
    coach: coachVal,
    judge: judgeVal
}
