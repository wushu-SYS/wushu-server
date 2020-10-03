const constants = require('../../constants')

async function updateCriminalRecordDB(path, id) {
    let sql = `INSERT INTO judge_files (id, criminalRecord) VALUES (@id,@criminalRecord)`;
    if (await checkIfNeedUpdate(id))
        sql = `UPDATE judge_files SET criminalRecord = @criminalRecord Where id= @id`;
    let ans = new Object();
    await dbUtils.sql(sql)
        .parameter('id', tediousTYPES.Int, id)
        .parameter('criminalRecord', tediousTYPES.NVarChar, path)
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

async function checkIfNeedUpdate(id) {
    let sql = `SELECT * FROM judge_files WHERE id = @id`
    let result = false
    await dbUtils.sql(sql)
        .parameter('id', tediousTYPES.Int, id)
        .execute()
        .then(function (results) {
            if (results.length != 0)
                result = true

        }).fail(function (err) {
            console.log(err)
        });
    return result
}


module.exports.updateCriminalRecordDB = updateCriminalRecordDB