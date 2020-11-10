const constants = require('../../constants')
const commonFunc = require('../../implementation/commonFunc')
const dbConnection = require('../../dbUtils').dbConnection

//TODO: CHECK FOR DUPLICATE insertSportsmanToCompetitionDB & excelInsertSportsmanToCompetitionDB ,deleteSportsmanFromCompetitionDB

async function deleteExcelSportsmanFromCompetitionDB(trans, sportsmem, sportsmenDetails, i, compId) {
    if (sportsmenDetails != undefined) {
        if (sportsmenDetails.id.length > 0) {
            await trans.query({
                sql: `DELETE FROM competition_sportsman WHERE idCompetition=:compId and idSportsman = :id ;`,
                params: {
                    compId: compId,
                    id: sportsmenDetails.id
                }
            }).then(async function () {
                if (i + 1 < sportsmem.length) {
                    await deleteExcelSportsmanFromCompetitionDB(trans, sportsmem, sportsmem[i + 1], i + 1, compId);
                }
            });
        }
        return trans
    }
}

async function excelInsertSportsmanToCompetitionDB(trans, insertSportsman, sportsmanDetails, i, compId) {
    if (sportsmanDetails != undefined) {
        return trans.query({
            sql: `INSERT INTO competition_sportsman (idCompetition, idSportsman, category, indx) Values (:compId,:id,:category,:idx)`,
            params: {
                compId: compId,
                id: sportsmanDetails.id,
                category: sportsmanDetails.category,
                idx: -1
            }
        }).then(async function () {
            if (i + 1 < insertSportsman.length) {
                await excelInsertSportsmanToCompetitionDB(trans, insertSportsman, insertSportsman[i + 1], i + 1, compId)
            }
        })
    }
}

async function insertSportsmanToCompetitionDB(trans, insertSportsman, sportsmanDetails, i, compId) {
    if (sportsmanDetails != undefined)
        return trans.query({
            sql: `INSERT INTO competition_sportsman (idCompetition, idSportsman, category)
                     SELECT * FROM (select :compId as idCompetition, :id as idSportsman, :category as category, :idx as indx) AS tmp
                     WHERE NOT EXISTS (
                     SELECT idCompetition, idSportsman, category FROM competition_sportsman WHERE idCompetition = :compId and idSportsman = :id and category = :category)`,
            params: {
                compId: compId,
                id: sportsmanDetails.id,
                category: sportsmanDetails.category,
                idx : -1
            }
        }).then(async function () {
            if (i + 1 < insertSportsman.length) {
                await insertSportsmanToCompetitionDB(trans, insertSportsman, insertSportsman[i + 1], i + 1, compId)
            }
        })
}

async function deleteSportsmanFromCompetitionDB(trans, insertSportsman, sportsmanDetails, i, compId) {
    if (sportsmanDetails != undefined)
        return trans.query({
            sql: `DELETE FROM competition_sportsman WHERE idCompetition=:compId and idSportsman = :id and category = :category;`,
            params: {
                compId: compId,
                id: sportsmanDetails.id,
                category: sportsmanDetails.category
            }
        }).then(async function () {
            if (i + 1 < insertSportsman.length)
                await deleteSportsmanFromCompetitionDB(trans, insertSportsman, insertSportsman[i + 1], i + 1, compId)
        })
}

async function updateSportsmanInCompetitionDB(trans, updateSportsman, sportsmanDetails, i, compId) {
    if (sportsmanDetails != undefined)
        return trans.query({
            sql: `update competition_sportsman
                      set category = :category, isDeleted = :isDeleted, indx = :indx
                      where idSportsman = :idSportsman and idCompetition = :idCompetition and category = :oldCategory`,
            params: {
                idSportsman: sportsmanDetails.id,
                category: sportsmanDetails.category,
                isDeleted: sportsmanDetails.isDeleted ? 1 : 0,
                idCompetition: compId,
                oldCategory: sportsmanDetails.oldCategory,
                indx: sportsmanDetails.indx !== undefined ? sportsmanDetails.indx : -1
            }
        }).then(async function () {
            if (i + 1 < updateSportsman.length)
                await updateSportsmanInCompetitionDB(trans, updateSportsman, updateSportsman[i + 1], i + 1, compId);
        });
}

async function getNewSportsmanRegistrationComp(compId) {
    let res = new Object();
    await dbConnection.query({
        sql: `select idSportsman,category, indx from competition_sportsman where idCompetition =:compId and indx = -1`,
        params: {
            compId: compId
        }
    }).then((results) => {
        res = results.results
    }).catch((err) => {
        console.log(err)
    });
    console.log(res)
    return res

}

async function getOldSportsmanRegistrationComp(compId) {
    let res = new Object();
    await dbConnection.query({
        sql: `select idSportsman,category, indx from competition_sportsman where idCompetition =:compId and indx!=-1 order by indx `,
        params: {
            compId: compId
        }
    }).then((results) => {
        res = results.results
    }).catch((err) => {
        console.log(err)
    });
    console.log(res)
    return res
}

async function updateIndexSportsmanRegistration(trans, sportsman, sportsmanDetails, i, compId) {
    if (sportsmanDetails != undefined)
        return trans.query({
            sql: `update competition_sportsman set indx=:indx where idCompetition=:compId and idSportsman=:idSportsman and category=:category;`,
            params: {
                compId: compId,
                idSportsman: sportsmanDetails.idSportsman,
                category: sportsmanDetails.category,
                indx: sportsmanDetails.indx
            }
        }).then(async function () {
            if (i + 1 < sportsman.length)
                await updateIndexSportsmanRegistration(trans, sportsman, sportsman[i + 1], i + 1, compId)
        });
}

async function getSportsmenRegistrationState(compId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `Select user_Sportsman.id, firstname, lastname, category, c.name as categoryName, c.minAge as minAge, c.maxAge as maxAge, c.sex as categorySex, isDeleted, user_Sportsman.sex, FLOOR(DATEDIFF(now(), birthdate) / 365.25) as age, sportclub, indx
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    left join category as c
                    on competition_sportsman.category = c.id
                    where competition_sportsman.idCompetition = :compId
                    order by indx`,
        params: {
            compId: compId
        }
    }).then((results) => {
        results.results
            .map(r => r.isDeleted = r.isDeleted[0])
        ans.status = constants.statusCode.ok;
        ans.results = commonFunc.sortUsers(results.results)
    }).catch((err) => {
        console.log(err)
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
