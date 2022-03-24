const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

async function updateMedicalScanDB(path, id) {
    let sql = `INSERT INTO sportman_files (id, medicalscan,insurance,moreFiles) VALUES (:id,:medicalScan, :insurance,:moreFiles)`;
    if (await checkIfNeedUpdate(id))
        sql = `UPDATE sportman_files SET medicalscan = :medicalScan Where id= :id`
    let ans = new Object();
    await dbConnection.query({
        sql: sql,
        params: {
            id: id,
            medicalScan: path,
            insurance: ''
        }
    }).then(function () {
        ans.status = constants.statusCode.ok;
        ans.results = "upload"
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

async function checkIfNeedUpdate(id) {
    let sql = `SELECT * FROM sportman_files WHERE id = :id`
    let result = false
    await dbConnection.query({
        sql: sql,
        params: {id: id}
    }).then(function (results) {
        if (results.results.length != 0)
            result = true
    }).catch(function (err) {
        console.log(err)
    });
    return result
}

async function updateHealthInsuranceDB(path, id) {
    let sql = `INSERT INTO sportman_files (id, insurance,medicalscan,moreFiles) VALUES (:id,:insurance,:medicalscan,:moreFiles)`;
    if (await checkIfNeedUpdate(id))
        sql = `UPDATE sportman_files SET insurance = :insurance Where id= :id`;
    let ans = new Object();
    await dbConnection.query({
        sql: sql,
        params: {
            id: id,
            insurance: path,
            medicalscan:''
            }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = "upload"

    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}
async function updatemoreFilesDB(path, id) {
    let sql = `INSERT INTO sportman_files (id, insurance,medicalscan,moreFiles) VALUES (:id,:insurance,:medicalscan,:moreFiles)`;
    if (await checkIfNeedUpdate(id))
        sql = `UPDATE sportman_files SET insurance = :insurance Where id= :id`;
    let ans = new Object();
    await dbConnection.query({
        sql: sql,
        params: {
            id: id,
            insurance: path,
            moreFiles:''
            
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = "upload"

    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

module.exports.updateMedicalScanDB = updateMedicalScanDB
module.exports.updateHealthInsuranceDB = updateHealthInsuranceDB