/**
 * handle the whole user validation
 */
const userValidation = require("../userValidations/usersValidations");
const constants = require("../../../constants");
const common_func = require("../../commonFunc");

/**
 * validate sportsman for excel insert
 * @param user - to validate
 * @return errors list for the given list, return empty list if all fields are valid
 */
function sportsManExcelValidations(user) {
    let errList = [];
    pushErrorsToList(errList, userValidation.sportsman.idVal(user[constants.colRegisterSportsmanExcel.idSportsman]));
    pushErrorsToList(errList, userValidation.sportsman.firstNameVal(user[constants.colRegisterSportsmanExcel.firstName]));
    pushErrorsToList(errList, userValidation.sportsman.lastNameVal(user[constants.colRegisterSportsmanExcel.lastName]));
    pushErrorsToList(errList, userValidation.sportsman.phoneVal(user[constants.colRegisterSportsmanExcel.phone], constants.userType.sportsman));
    pushErrorsToList(errList, userValidation.sportsman.addressVal(user[constants.colRegisterSportsmanExcel.address], constants.userType.sportsman));
    pushErrorsToList(errList, userValidation.sportsman.emailVal(user[constants.colRegisterSportsmanExcel.email], constants.userType.sportsman));
    pushErrorsToList(errList, userValidation.sportsman.setBirthDate(user[constants.colRegisterSportsmanExcel.birthDate]));
    pushErrorsToList(errList, userValidation.sportsman.sexVal(user[constants.colRegisterSportsmanExcel.sex]));
    pushErrorsToList(errList, userValidation.sportsman.sportStyleVal(user[constants.colRegisterSportsmanExcel.sportStyle]));
    pushErrorsToList(errList, userValidation.sportsman.sportClubVal(user[constants.colRegisterSportsmanExcel.sportClub]));
    pushErrorsToList(errList, userValidation.sportsman.idCoachVal(user[constants.colRegisterSportsmanExcel.idCoach]));

    return errList
}

/**
 * validate sportsman for manual insert or update
 * @param user - to validate
 * @param isUpdate - true if the calling query is update, else false
 * @return list of errors, return empty list if all fields are valid
 */
function sportsmanManualValidations(user, isUpdate) {
    let errList = [];
    pushErrorsToList(errList, userValidation.sportsman.idVal(user.id));
    pushErrorsToList(errList, userValidation.sportsman.firstNameVal(user.firstName));
    pushErrorsToList(errList, userValidation.sportsman.lastNameVal(user.lastName));
    pushErrorsToList(errList, userValidation.sportsman.phoneVal(user.phone, constants.userType.sportsman));
    pushErrorsToList(errList, userValidation.sportsman.addressVal(user.address, constants.userType.sportsman));
    pushErrorsToList(errList, userValidation.sportsman.emailVal(user.email, constants.userType.sportsman));
    pushErrorsToList(errList, userValidation.sportsman.setBirthDate(user.birthDate));
    pushErrorsToList(errList, userValidation.sportsman.sexVal(user.sex));
    pushErrorsToList(errList, userValidation.sportsman.sportStyleVal(user.sportStyle));

    if (!isUpdate) {
        pushErrorsToList(errList, userValidation.sportsman.sportClubVal(user.sportClub));
        //pushErrorsToList(errList, userValidation.sportsman.idCoachVal(user.idCoach));
    }
    return errList
}

/**
 * validate judge for manual insert
 * @param user - to validate
 * @return list of errors, return empty list if all fields are valid
 */
function judgeManualValidation(user) {
    let errList = [];
    pushErrorsToList(errList, userValidation.judge.idVal(user.id));
    pushErrorsToList(errList, userValidation.judge.firstNameVal(user.firstName));
    pushErrorsToList(errList, userValidation.judge.lastNameVal(user.lastName));
    pushErrorsToList(errList, userValidation.judge.emailVal(user.email, constants.userType.judge));
    pushErrorsToList(errList, userValidation.judge.phoneVal(user.phone, constants.userType.judge));
    return errList

}

/**
 * validate coach for manual insert or update
 * @param user - to validate
 * @param isUpdate - true if the calling query is update, else false
 * @return list of errors, return empty list if all fields are valid
 */
function coachManualValidation(user, isUpdate) {
    let errList = [];
    pushErrorsToList(errList, userValidation.coach.idVal(user.id));
    pushErrorsToList(errList, userValidation.coach.firstNameVal(user.firstName));
    pushErrorsToList(errList, userValidation.coach.lastNameVal(user.lastName));
    pushErrorsToList(errList, userValidation.coach.emailVal(user.email, constants.userType.coach));
    pushErrorsToList(errList, userValidation.coach.phoneVal(user.phone, constants.userType.coach));
    pushErrorsToList(errList, userValidation.coach.addressVal(user.address, constants.userType.coach));

    if (!isUpdate) {
        pushErrorsToList(errList, userValidation.coach.sportClubVal(user.sportClub));
    }
    return errList
}

function pushErrorsToList(errList, err) {
    if (err != undefined)
        errList.push(err)
}

/**
 * validate coach for excel insert
 * @param user - to validate
 * @return list of errors for the given user, return empty list if all fields are valid
 */
function coachExcelValidation(user) {
    let errList = [];
    pushErrorsToList(errList, userValidation.coach.idVal(user[constants.colRegisterCoachExcel.idCoach]));
    pushErrorsToList(errList, userValidation.coach.firstNameVal(user[constants.colRegisterCoachExcel.firstName]));
    pushErrorsToList(errList, userValidation.coach.lastNameVal(user[constants.colRegisterCoachExcel.lastName]));
    pushErrorsToList(errList, userValidation.coach.addressVal(user[constants.colRegisterCoachExcel.address]));
    pushErrorsToList(errList, userValidation.coach.emailVal(user[constants.colRegisterCoachExcel.email]));
    pushErrorsToList(errList, userValidation.coach.sportClubVal(user[constants.colRegisterCoachExcel.sportClub]));
    pushErrorsToList(errList, userValidation.coach.phoneVal(user[constants.colRegisterCoachExcel.phone]));

    return errList
}


function judgeExcelValidation(user) {
    let errList = [];
    pushErrorsToList(errList, userValidation.judge.idVal(user[constants.colRegisterJudgeExcel.id]));
    pushErrorsToList(errList, userValidation.judge.firstNameVal(user[constants.colRegisterJudgeExcel.firstName]));
    pushErrorsToList(errList, userValidation.judge.lastNameVal(user[constants.colRegisterJudgeExcel.lastName]));
    pushErrorsToList(errList, userValidation.judge.emailVal(user[constants.colRegisterJudgeExcel.email]));
    pushErrorsToList(errList, userValidation.coach.phoneVal(user[constants.colRegisterJudgeExcel.phone]));

    return errList
}

/**
 * the main handler, deciding which validator is needed by the user type
 * @param users - the list of users to validate
 * @param userType - sportsman/coach
 * @return {user, results} - results are the errors for the appropriate user
 */
function checkExcelDataBeforeRegister(users, userType) {
    let errorUsers = [];
    let res = {};
    res.isPassed = true;
    let line = 0;
    users.forEach(function (user) {
        let userError = new Object();
        line++;
        switch (userType) {
            case "sportsman":
                user[constants.colRegisterSportsmanExcel.sportClub] = getClubId(user[constants.colRegisterSportsmanExcel.sportClub]);
                user[constants.colRegisterSportsmanExcel.idCoach] = getCoachId(user[constants.colRegisterSportsmanExcel.idCoach]);
                user.push(common_func.setIsTaullo(user[constants.colRegisterSportsmanExcel.sportStyle]));
                user.push(common_func.setIsSanda(user[constants.colRegisterSportsmanExcel.sportStyle]));
                user[constants.colRegisterSportsmanExcel.birthDate] = common_func.setMysqlDateFormat(user[constants.colRegisterSportsmanExcel.birthDateYear]+"/"+user[constants.colRegisterSportsmanExcel.birthDateMonth]+"/"+user[constants.colRegisterSportsmanExcel.birthDateDay]);
                userError.errors = sportsManExcelValidations(user);
                break;
            case "coach":
                user[constants.colRegisterCoachExcel.sportClub] = getClubId(user[constants.colRegisterCoachExcel.sportClub]);
                userError.errors = coachExcelValidation(user);
                break;
            case 'judge':
                userError.errors = judgeExcelValidation(user);


        }
        if (userError.errors.length !== 0) {
            userError.line = line;
            errorUsers.push(userError);
            res.isPassed = false;
        }
    });
    res.results = errorUsers;
    res.users = users;
    return res;

}

/**
 * the main handler, deciding which validator to apply
 * @param user - to validate
 * @param userType - sportsman/coach/judge
 * @return {user, results} - results are the errors for the appropriate user
 */
function checkDataBeforeRegister(user, userType) {
    let errorUsers = [];
    let res = new Object();
    res.isPassed = true;
    let userError;
    switch (userType) {
        case "sportsman":
            user.birthDate = common_func.setMysqlDateFormat(user.birthDate);
            user.taullo = common_func.setIsTaullo(user.sportStyle)
            user.sanda = common_func.setIsSanda(user.sportStyle)
            userError = new Object();
            userError.errors = sportsmanManualValidations(user, false);
            break;
        case "coach":
            user.birthDate = common_func.setMysqlDateFormat(user.birthDate);
            userError = new Object();
            userError.errors = coachManualValidation(user, false);
            break;
        case "judge":
            userError = new Object();
            userError.errors = judgeManualValidation(user, false);
            break;
    }


    if (userError.errors.length !== 0) {
        userError.line = 1;
        errorUsers.push(userError);
        res.isPassed = false;
    }
    res.results = errorUsers;
    var size = 0,
    key;
    for (key in user) {
        size++;
    }
    if(size==13){
        let date_split=user.birthDate.split('-')
        user.birthDateYear=date_split[0];
        user.birthDateMonth=date_split[1];
        user.birthDateDay=date_split[2];
    }
    res.users = user;

    return res;
}

function getClubId(line) {
    line = line.split(" ")[line.split(" ").length - 1];
    line = line.substring(0, line.length - 1);
    return parseInt(line)

}

function getCoachId(line) {
    line = line.split(" ")[line.split(" ").length - 1];
    line = line.substring(0, line.length - 1);
    if (line.startsWith('0')) {
        line = line.substring(1)
    }
    return parseInt(line)

}

function validateUserDetails(user, userType) {
    let userError;
    switch (userType) {
        case "sportsman":
            user.birthDate = common_func.setMysqlDateFormat(user.birthDate);
            userError = sportsmanManualValidations(user, true);
            break;
        case "coach" :
            user.birthDate = common_func.setMysqlDateFormat(user.birthDate);
            userError = coachManualValidation(user, true);
            break;
        case "judge":
            userError = judgeManualValidation(user);
            break;

    }
    let ans = new Object();
    ans.canUpdate = (userError.length == 0);
    ans.data = user;
    return ans
}


module.exports.checkExcelDataBeforeRegister = checkExcelDataBeforeRegister;
module.exports.checkDataBeforeRegister = checkDataBeforeRegister;
module.exports.validateUserDetails = validateUserDetails;
