function checkIdUser(id) {
    return (validator.isInt(id.toString()) && id.toString().length == 9)
}

function checkFirstNameLastName(name) {

    return ((validator.matches(name).toString(), Constants.hebRegex) && (name.toString().length > 1))
}


function checkAddress(address) {
    return ((validator.matches(address).toString(), Constants.regexHebrewAndNumbers) && address.toString().length > 2);
}

function checkBirthDate(birthdate) {
    let birthDateSplit = birthdate.split('/');
    return (birthDateSplit.length == 3 && birthDateSplit[0].length == 2 && birthDateSplit[1].length == 2 && birthDateSplit[2].length == 4)
}

function checkPhone(phone) {
    return (validator.isInt(phone.toString()) && phone.toString().length == 10)
}

function checkEmail(email) {
    return (validator.isEmail(email).toString())
}

function checkSportClub(sportClub) {
    return (validator.isInt(sportClub.toString()))
}

function checkSex(sex) {
    return ((sex.toString() in Constants.sexEnum))
}

function checkSportStyle(sportStyle) {
    return ((sportStyle.toString() in Constants.sportType))
}

function getClubId(line) {
    line = line.split(" ")[line.split(" ").length - 1];
    line = line.substring(0, line.length - 1);
    return parseInt(line)

}

module.exports = {
    checkIdUser: checkIdUser,
    checkFirstNameLastName: checkFirstNameLastName,
    checkAddress: checkAddress,
    checkBirthDate: checkBirthDate,
    checkPhone: checkPhone,
    checkEmail: checkEmail,
    checkSportClub: checkSportClub,
    checkSex: checkSex,
    checkSportStyle: checkSportStyle,
    getClubId: getClubId

}