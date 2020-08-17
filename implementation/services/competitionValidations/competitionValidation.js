const constants = require("../../../constants")

function checkNumOfJudgesGrade(userLength,numOfJudges){
    if(userLength!=(constants.numFieldsTaulloExcelUploadGrade+numOfJudges))
        return constants.excelCompUploadGradeErrMsg.fieldsMissing
}

let taullo ={
    checkNumOfJudgesGrade :checkNumOfJudgesGrade
}

module.exports.taullo =taullo