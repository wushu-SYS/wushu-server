const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

async function updateCriminalRecordDB(path, id) {
    let sql = `INSERT INTO judge_files (id, criminalRecord) VALUES (:id,:criminalRecord)`;
    if (await checkIfNeedUpdate(id))
        sql = `UPDATE judge_files SET criminalRecord = :criminalRecord Where id= :id`;
    let ans = new Object();
    await dbConnection.query({
        sql: sql,
        params: {
            id: id,
            criminalRecord: path
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
    let sql = `SELECT * FROM judge_files WHERE id = :id`
    let result = false
    await dbConnection.query({
        sql: sql,
        params: {
            id: id
        }
    }).then(function (results) {
        if (results.results.length != 0)
            result = true
    }).catch(function (err) {
        console.log(err)
    });
    return result
}


module.exports.updateCriminalRecordDB = updateCriminalRecordDB