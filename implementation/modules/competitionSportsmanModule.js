const constants = require('../../constants')
const commonFunc = require('../../implementation/commonFunc')
//TODO: CHECK FOR DUPLICATE insertSportsmanToCompetitionDB & excelInsertSportsmanToCompetitionDB ,deleteSportsmanFromCompetitionDB

function deleteExcelSportsmanFromCompetitionDB(trans, sportsmem, sportsmenDetails, i, compId) {
    if (sportsmenDetails != undefined) {
        if (sportsmenDetails.id.length > 0) {
            return trans.sql(`DELETE FROM competition_sportsman WHERE idCompetition=@compId and idSportsman = @id ;`)
                .parameter('compId', tediousTYPES.Int, compId)
                .parameter('id', tediousTYPES.Int, sportsmenDetails.id)
                .execute()
                .then(async function (testResult) {
                    if (i + 1 < sportsmem.length) {
                        await deleteExcelSportsmanFromCompetitionDB(trans, sportsmem, sportsmem[i + 1], i + 1, compId);
                    }
                    return testResult
                });
        }
    }
    return;
}
async function excelInsertSportsmanToCompetitionDB(trans, insertSportsman, sportsmanDetails, i, compId) {
    if (sportsmanDetails != undefined) {
        return trans.sql(`INSERT INTO competition_sportsman (idCompetition, idSportsman, category) Values (@compId,@id,@category)`)
            .parameter('compId', tediousTYPES.Int, compId)
            .parameter('id', tediousTYPES.Int, sportsmanDetails.id)
            .parameter('category', tediousTYPES.Int, sportsmanDetails.category)
            .execute()
            .then(async function (testResult) {
                if (i + 1 < insertSportsman.length) {
                    await excelInsertSportsmanToCompetitionDB(trans, insertSportsman, insertSportsman[i + 1], i + 1, compId)
                }
                return testResult
            })
    }
    return;
}
async function insertSportsmanToCompetitionDB(trans, insertSportsman, sportsmanDetails, i, compId) {
    if (sportsmanDetails != undefined)
        return trans.sql(`INSERT INTO competition_sportsman (idCompetition, idSportsman, category)
                     SELECT * FROM (select @compId as idCompetition, @id as idSportsman, @category as category) AS tmp
                     WHERE NOT EXISTS (
                     SELECT idCompetition, idSportsman, category FROM competition_sportsman WHERE idCompetition = @compId and idSportsman = @id and category = @category)`)
            .parameter('compId', tediousTYPES.Int, compId)
            .parameter('id', tediousTYPES.Int, sportsmanDetails.id)
            .parameter('category', tediousTYPES.NVarChar, sportsmanDetails.category)
            .execute()
            .then(async function (testResult) {
                if (i + 1 < insertSportsman.length) {
                    await insertSportsmanToCompetitionDB(trans, insertSportsman, insertSportsman[i + 1], i + 1, compId)
                }
                return testResult
            })
    return;
}
async function deleteSportsmanFromCompetitionDB(trans, insertSportsman, sportsmanDetails, i, compId) {
    if (sportsmanDetails != undefined)
        return trans.sql(`DELETE FROM competition_sportsman WHERE idCompetition=@compId and idSportsman = @id and category = @category;`)
            .parameter('compId', tediousTYPES.Int, compId)
            .parameter('id', tediousTYPES.Int, sportsmanDetails.id)
            .parameter('category', tediousTYPES.NVarChar, sportsmanDetails.category)
            .execute()
            .then(async function (testResult) {
                if (i + 1 < insertSportsman.length)
                    await deleteSportsmanFromCompetitionDB(trans, insertSportsman, insertSportsman[i + 1], i + 1, compId)
                return testResult
            })
    return;
}
async function updateSportsmanInCompetitionDB(trans, updateSportsman, sportsmanDetails, i, compId) {
    if (sportsmanDetails != undefined)
        return trans.sql(`update competition_sportsman
                      set category = @category, isDeleted = @isDeleted, indx = @indx
                      where idSportsman = @idSportsman and idCompetition = @idCompetition and category = @oldCategory`)
            .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails.id)
            .parameter('category', tediousTYPES.Int, sportsmanDetails.category)
            .parameter('isDeleted', tediousTYPES.Bit, sportsmanDetails.isDeleted ? 1 : 0)
            .parameter('idCompetition', tediousTYPES.Int, compId)
            .parameter('oldCategory', tediousTYPES.Int, sportsmanDetails.oldCategory)
            .parameter('indx', tediousTYPES.Int, sportsmanDetails.indx)
            .execute()
            .then(async function (testResult) {
                if (i + 1 < updateSportsman.length)
                    await updateSportsmanInCompetitionDB(trans, updateSportsman, updateSportsman[i + 1], i + 1, compId);
                return testResult
            });
    return;
}
async function getNewSportsmanRegistrationComp(compId) {
    let res =new Object();
    await dbUtils.sql(`select idSportsman,category, indx from competition_sportsman where idCompetition =@compId and indx=-1`)
        .parameter('compId', tediousTYPES.Int, compId)
        .execute()
        .then((results) => {
            res = results
        })
        .fail((err) => {
            console.log(err)
        });
    return res

}
async function getOldSportsmanRegistrationComp(compId) {
    let res =new Object();
    await dbUtils.sql(`select idSportsman,category, indx from competition_sportsman where idCompetition =@compId and indx!=-1 order by indx `)
        .parameter('compId', tediousTYPES.Int, compId)
        .execute()
        .then((results) => {
            res = results
        })
        .fail((err) => {
            console.log(err)
        });
    return res
}
async function updateIndexSportsmanRegistration(trans, sportsman, sportsmanDetails, i, compId){
    if (sportsmanDetails != undefined)
        return trans.sql(`update competition_sportsman set indx=@indx where idCompetition=@compId and idSportsman=@idSportsman and category=@category;`)
            .parameter('compId', tediousTYPES.Int, compId)
            .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails.idSportsman)
            .parameter('category', tediousTYPES.Int, sportsmanDetails.category)
            .parameter('indx', tediousTYPES.Int, sportsmanDetails.indx)
            .execute()
            .then(async function (testResult) {
                if (i + 1 < sportsman.length)
                    await updateIndexSportsmanRegistration(trans, sportsman, sportsman[i + 1], i + 1, compId)
                return testResult
            });
    return;
}
async function getSportsmenRegistrationState(compId) {
    let ans = new Object();
    await dbUtils.sql(`Select user_Sportsman.id, firstname, lastname, category, c.name as categoryName, c.minAge as minAge, c.maxAge as maxAge, c.sex as categorySex, isDeleted, user_Sportsman.sex, FLOOR(DATEDIFF(DAY, birthdate, getdate()) / 365.25) as age, sportclub, indx
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    left join category as c
                    on competition_sportsman.category = c.id
                    where competition_sportsman.idCompetition = @compId
                    order by indx`)
        .parameter('compId', tediousTYPES.Int, compId)
        .execute()
        .then((results) => {
            ans.status = constants.statusCode.ok;
            ans.results = commonFunc.sortUsers(results)
        })
        .fail((err) => {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        })
    return ans;
}



module.exports.deleteExcelSportsmanFromCompetitionDB = deleteExcelSportsmanFromCompetitionDB
module.exports.excelInsertSportsmanToCompetitionDB = excelInsertSportsmanToCompetitionDB
module.exports.insertSportsmanToCompetitionDB = insertSportsmanToCompetitionDB
module.exports.deleteSportsmanFromCompetitionDB = deleteSportsmanFromCompetitionDB
module.exports.updateSportsmanInCompetitionDB = updateSportsmanInCompetitionDB
module.exports.getNewSportsmanRegistrationComp = getNewSportsmanRegistrationComp
module.exports.getOldSportsmanRegistrationComp = getOldSportsmanRegistrationComp
module.exports.updateIndexSportsmanRegistration = updateIndexSportsmanRegistration
module.exports.getSportsmenRegistrationState = getSportsmenRegistrationState