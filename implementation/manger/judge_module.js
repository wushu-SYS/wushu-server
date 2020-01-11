const pass = require("../coach/user_module")


async function insertNewJudgeDB(trans, judges, judge, number) {
    return trans.sql(` INSERT INTO user_Judge (id, firstname, lastname, phone, email,photo)
                                    VALUES (@idSportsman, @firstName, @lastName, @phone, @email ,@photo)`)
        .parameter('idSportsman', tediousTYPES.Int, judge[Constants.colRegisterJudgeExcel.id])
        .parameter('firstName', tediousTYPES.NVarChar, judge[Constants.colRegisterJudgeExcel.firstName])
        .parameter('lastName', tediousTYPES.NVarChar, judge[Constants.colRegisterJudgeExcel.lastName])
        .parameter('phone', tediousTYPES.NVarChar, judge[Constants.colRegisterJudgeExcel.phone])
        .parameter('email', tediousTYPES.NVarChar, judge[Constants.colRegisterJudgeExcel.email])
        .parameter('photo', tediousTYPES.NVarChar, Constants.defaultProfilePic)
        .execute()
        .then(async function (testResult) {
            if (number + 1 < judges.length)
                await insertNewJudgeDB(trans, judges, judge[number + 1], number + 1)
            return testResult
        })
}
async function registerNewJudge(judges) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await insertNewJudgeDB(trans, judges, judges[0], 0), await pass.insertPasswordDB(trans, judges, judges[0], 0, Constants.userType.JUDGE)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = Constants.statusCode.ok;
                    ans.results = Constants.msg.registerSuccess;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = Constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                }))
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        });

    return ans
}

function cleanCoachAsJudgeExcelData (data) {
   let judges =[];
    data.forEach((judge)=>{
       if(judge.length==4)
           judges.push(judge[0])
   })
    return judges;
}

async function registerCoachAsJudge (judges){
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return trans.sql(`Insert into user_Judge (id,firstname,lastname,phone,photo,email)
                        SELECT id, firstname, lastname, phone,photo,email
                        from user_Coach
                        where id in (${judges})`)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = Constants.statusCode.ok;
            ans.results =Constants.msg.registerSuccess
            trans.commitTransaction();
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans;
}



module.exports.registerNewJudge = registerNewJudge;
module.exports.cleanCoachAsJudgeExcelData=cleanCoachAsJudgeExcelData;
module.exports.registerCoachAsJudge=registerCoachAsJudge;
