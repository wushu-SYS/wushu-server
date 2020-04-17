const competition_validations = require("../competitionValidations/competitionValidation");
const constants = require("../../../constants");
const common_func = require("../../commonFunc");




function taulloCompGradeExcelValidations(user,numOfJudge) {
    let errList = [];
    pushErrorsToList(errList, competition_validations.taullo.checkNumOfJudgesGrade(user.length,numOfJudge));


    return errList
}

function pushErrorsToList(errList, err) {
    if (err != undefined)
        errList.push(err)
}

function
checkExcelCompetitionsGrade(data,compType,numOfJudge){
    let errorUsers = [];
    let res = {};
    res.isPassed = true;
    let line = 1;
    data.forEach(function (user) {
        let userError = new Object();
        line++;
        switch (compType) {
            case constants.sportStyle.taullo :
                userError.errors = taulloCompGradeExcelValidations(user,numOfJudge);
                break;
            case constants.sportStyle.sanda:
                break;

        }
        if (userError.errors.length !== 0) {
            userError.line = line;
            errorUsers.push(userError);
            res.isPassed = false;
        }
    });
    res.results = errorUsers;
    res.users = data;
    return res;
}




module.exports.checkExcelCompetitionsGrade=checkExcelCompetitionsGrade