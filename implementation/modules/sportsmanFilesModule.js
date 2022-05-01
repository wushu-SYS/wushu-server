const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

async function updateMedicalScanDB(path, id) {
    let ans = new Object();
    let archiveSql = `INSERT INTO sportman_files_archive (sportman_id, file_type, url, replaced_at) 
                      SELECT id, 'medicalscan', medicalscan, now()
                      FROM sportman_files
                      WHERE id = :id
                      AND medicalscan IS NOT NULL`;
    let sql = `INSERT INTO sportman_files (id, medicalscan) VALUES (:id,:medicalScan)`;
    if (await checkIfNeedUpdate(id))
        sql = `UPDATE sportman_files SET medicalscan = :medicalScan Where id= :id`


    await dbConnection.query({
        sql: archiveSql,
        params: {
            id: id
        }
    }).then(async function() {
        await dbConnection.query({
            sql: sql,
            params: {
                id: id,
                medicalScan: path
            }
        })
    }).then(function() {
        ans.status = constants.statusCode.ok;
        ans.results = "upload"
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

async function deleteMedicalScanDB(id) {
    sql = `UPDATE sportman_files SET medicalscan = null Where id = :id`
    let archiveSql = `INSERT INTO sportman_files_archive (sportman_id, file_type, url, replaced_at) 
                      SELECT id, 'medicalscan', medicalscan, now()
                      FROM sportman_files
                      WHERE id = :id
                      AND medicalscan IS NOT NULL`;

    let ans = new Object();

    await dbConnection.query({
        sql: archiveSql,
        params: {
            id: id
        }
    }).then(async function() {
        await dbConnection.query({
            sql: sql,
            params: {
                id: id
            }
        })
    }).then(function() {
        ans.status = constants.statusCode.ok;
        ans.results = "delete"
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
        params: { id: id }
    }).then(function(results) {
        if (results.results.length != 0)
            result = true
    }).catch(function (err) {
        console.log(err)
    });
    return result
}


async function updateHealthInsuranceDB(path, id) {
    let sql = `INSERT INTO sportman_files (id, insurance) VALUES (:id, :insurance)`;
    if (await checkIfNeedUpdate(id))
        sql = `UPDATE sportman_files SET insurance = :insurance Where id= :id`;
    let archiveSql = `INSERT INTO sportman_files_archive (sportman_id, file_type, url, replaced_at) 
                      SELECT id, 'insurance', insurance, now()
                      FROM sportman_files
                      WHERE id = :id
                      AND insurance IS NOT NULL`;

    let ans = new Object();

    await dbConnection.query({
        sql: archiveSql,
        params: {
            id: id
        }
    }).then(async function() {
        await dbConnection.query({
            sql: sql,
            params: {
                id: id,
                insurance: path
            }
        })
    }).then(function(results) {
        ans.status = constants.statusCode.ok;
        ans.results = "upload"

    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}
async function deleteHealthInsuranceDB(id) {
    sql = `UPDATE sportman_files SET insurance = null Where id = :id`;
    let archiveSql = `INSERT INTO sportman_files_archive (sportman_id, file_type, url, replaced_at) 
                      SELECT id, 'insurance', insurance, now()
                      FROM sportman_files
                      WHERE id = :id
                      AND insurance IS NOT NULL`;

    let ans = new Object();

    await dbConnection.query({
        sql: archiveSql,
        params: {
            id: id
        }
    }).then(async function() {
        await dbConnection.query({
            sql: sql,
            params: {
                id: id
            }
        })
    }).then(function(results) {
        ans.status = constants.statusCode.ok;
        ans.results = "delete"

    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}
async function updatemoreFilesDB(path, id) {
    let sql = `INSERT INTO sportman_files (id, moreFiles) VALUES (:id, :moreFiles)`;
    if (await checkIfNeedUpdate(id))
        sql = `UPDATE sportman_files SET moreFiles = :moreFiles Where id= :id`;
    let archiveSql = `INSERT INTO sportman_files_archive (sportman_id, file_type, url, replaced_at) 
                      SELECT id, 'moreFiles', moreFiles, now()
                      FROM sportman_files
                      WHERE id = :id
                      AND moreFiles IS NOT NULL`;

    let ans = new Object();

    await dbConnection.query({
        sql: archiveSql,
        params: {
            id: id
        }
    }).then(async function() {
        await dbConnection.query({
            sql: sql,
            params: {
                id: id,
                moreFiles: path
            }
        })
    }).then(function(results) {
        ans.status = constants.statusCode.ok;
        ans.results = "upload"

    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}
async function deletemoreFilesDB(id) {
    sql = `UPDATE sportman_files SET moreFiles = null Where id = :id`;
    let archiveSql = `INSERT INTO sportman_files_archive (sportman_id, file_type, url, replaced_at) 
                      SELECT id, 'moreFiles', moreFiles, now()
                      FROM sportman_files
                      WHERE id = :id
                      AND moreFiles IS NOT NULL`;

    let ans = new Object();

    await dbConnection.query({
        sql: archiveSql,
        params: {
            id: id
        }
    }).then(async function() {
        await dbConnection.query({
            sql: sql,
            params: {
                id: id
            }
        })
    }).then(function(results) {
        ans.status = constants.statusCode.ok;
        ans.results = "delete"

    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

module.exports.updateMedicalScanDB = updateMedicalScanDB
module.exports.deleteMedicalScanDB = deleteMedicalScanDB
module.exports.updateHealthInsuranceDB = updateHealthInsuranceDB
module.exports.deleteHealthInsuranceDB = deleteHealthInsuranceDB
module.exports.updatemoreFilesDB = updatemoreFilesDB
module.exports.deletemoreFilesDB = deletemoreFilesDB