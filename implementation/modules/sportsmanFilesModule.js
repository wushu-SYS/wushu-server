const constants =require('../../constants')

async function updateMedicalScanDB(path, id) {
    let sql = `INSERT INTO sportman_files (id, medicalscan) VALUES (@id,@medicalScan)`;
    if (await checkIfNeedUpdate(id))
        sql = `UPDATE sportman_files SET medicalscan = @medicalScan Where id= @id`
    let ans = new Object();
    await dbUtils.sql(sql)
        .parameter('id', tediousTYPES.Int, id)
        .parameter('medicalScan', tediousTYPES.NVarChar, path)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = "upload"

        }).fail(function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}
async function checkIfNeedUpdate(id){
    let sql = `SELECT * FROM sportman_files WHERE id = @id`
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
async function updateHealthInsuranceDB(path, id){
    let sql = `INSERT INTO sportman_files (id, insurance) VALUES (@id,@insurance)`;
    if(await checkIfNeedUpdate(id))
        sql =`UPDATE sportman_files SET insurance = @insurance Where id= @id`;
    let ans = new Object();
    await dbUtils.sql(sql)
        .parameter('id', tediousTYPES.Int, id)
        .parameter('insurance', tediousTYPES.NVarChar, path)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = "upload"

        }).fail(function (err) {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

module.exports.updateMedicalScanDB = updateMedicalScanDB
module.exports.updateHealthInsuranceDB = updateHealthInsuranceDB