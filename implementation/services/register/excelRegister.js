const constants =require('../../../constants')

function cleanCoachAsJudgeExcelData(data) {
    let judges = [];
    data.forEach((judge) => {
        if (judge.length == 4)
            judges.push(judge[0])
    })
    return judges;
}
module.exports.cleanCoachAsJudgeExcelData=cleanCoachAsJudgeExcelData