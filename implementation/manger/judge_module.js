const pass = require("../coach/user_module")
const functions_com =require("../../implementation/commonFunc")
function initQueryGetJudges(queryData) {
    let query = 'select * from user_Judge';

    if (queryData){
        if (queryData.competitionOperator === '=='){
            query += ' join competition_judge' +
                ' on user_Judge.id = competition_judge.idJudge' +
                ' where competition_judge.idCompetition = @compId';
        }
        else if (queryData.competitionOperator === '!='){
            query += ' except' +
                ' select user_Judge.* from user_Judge' +
                ' join competition_judge' +
                ' on user_Judge.id = competition_judge.idJudge' +
                ' where competition_judge.idCompetition = @compId';
        }
    }

    return query
}
async function getJudges(queryData){
    let query = initQueryGetJudges(queryData);
    let ans = new Object();
    let compId = queryData ? queryData.competitionId : undefined;
    await dbUtils.sql(query)
        .parameter('compId', tediousTYPES.Int, compId)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

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

/**
 * handle inserting new judge to the db
 * @param judges
 * @return {status, results}
 */
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

/**
 * handle registration of coach as a judge in the system
 * @param judges
 * @return {status, results}
 */
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

async function deleteJudge(judgeId){
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`DELETE FROM user_Passwords WHERE id = @judgeId;`)
                .parameter('judgeId', tediousTYPES.Int, judgeId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM user_Judge WHERE id = @judgeId;`)
                .parameter('judgeId', tediousTYPES.Int, judgeId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            //TODO: delete judge directory on drive - job name deleteSportsmanFilesFromGoogleDrive
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.userDeleted;
            trans.commitTransaction();
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans;
}

async function updateCriminalRecordDB (path,id){
    let sql = `INSERT INTO judge_files (id, criminalRecord) VALUES (@id,@criminalRecord)`;
    if(await checkIfNeedUpdate(id))
        sql =`UPDATE judge_files SET criminalRecord = @criminalRecord Where id= @id`;
    let ans = new Object();
    await dbUtils.sql(sql)
        .parameter('id', tediousTYPES.Int, id)
        .parameter('criminalRecord', tediousTYPES.NVarChar, path)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = "upload"

        }).fail(function (err) {
            console.log(err)
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

async function checkIfNeedUpdate(id){
    let sql = `SELECT * FROM judge_files WHERE id = @id`
    let result =false
    await dbUtils.sql(sql)
        .parameter('id', tediousTYPES.Int, id)
        .execute()
        .then(function (results) {
            if (results.length!=0)
                result= true

        }).fail(function (err) {
            console.log(err)
        });
    return result
}

async function getCompetitionsToJudgeById(judgeId){
    let ans = new Object();
    let query = `select * from events join events_competition ec on events.idEvent = ec.idEvent join competition_judge on ec.idCompetition = competition_judge.idCompetition where idJudge=@judgeId`
    await dbUtils.sql(query)
        .parameter('judgeId', tediousTYPES.Int, judgeId)
        .execute()
        .then(result => {
            ans.results =result
            ans.status = Constants.statusCode.ok;
        })
        .fail((error) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = error;
        });
    return ans
}

async function autoReminderForUploadCriminalRecord(){
    let judges=await getJudgesForReminder();
    judges.forEach((judge)=>{
        console.log(`[Log] - auto reminder for judge id ${judge.id} to upload criminal record by mail`)
        let msg = 'שלום,'+'\n'+'נא העלה רישום פלילי למערכת'+'\n'+'\n'+'תודה,'+'\n'+'מערכת או-שו'
        functions_com.sendEmail(judge.email,msg,'מערכת אושו -תזכורת')
    })

}
async function getJudgesForReminder(){
    let ans = new Object();
    await dbUtils.sql(`select user_Judge.id,email from user_Judge where user_Judge.id not in(select id from judge_files )`)
        .execute()
        .then(function (results) {
            ans = results
        }).fail(function (err) {
            console.log(err)
            ans = err;
        });
    return ans;
}




module.exports.getJudges = getJudges;
module.exports.registerNewJudge = registerNewJudge;
module.exports.cleanCoachAsJudgeExcelData=cleanCoachAsJudgeExcelData;
module.exports.registerCoachAsJudge=registerCoachAsJudge;
module.exports.deleteJudge = deleteJudge;
module.exports.updateCriminalRecordDB=updateCriminalRecordDB;
module.exports.getCompetitionsToJudgeById=getCompetitionsToJudgeById;
module.exports.autoReminderForUploadCriminalRecord=autoReminderForUploadCriminalRecord;
