async function getDetails(compId) {
    let ans = new Object();
    await dbUtils.sql(`select events_competition.idCompetition,events_competition.description,events_competition.sportStyle ,events_competition.status ,events_competition.closeRegDate, events_competition.closeRegTime, events.date ,events.location, events.startHour, events.city from events_competition
                                   left join events on events_competition.idEvent = events.idEvent
                                   where idCompetition= @compId`)
        .parameter('compId', tediousTYPES.Int, compId)
        .execute()
        .then((results) => {
            ans.status = Constants.statusCode.ok;
            ans.results = results[0]
        })
        .fail((err) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

async function insertSportsmanToCompetitonDB(trans, insertSportsman, sportsmanDetails, i, compId) {
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
                    await insertSportsmanToCompetitonDB(trans, insertSportsman, insertSportsman[i + 1], i + 1, compId)
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


async function registerSportsmenToCompetition(insertSportsman, deleteSportsman, compId) {
    let ans = new Object()
    let trans;
    console.log(insertSportsman)
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(insertSportsman[0] ? await insertSportsmanToCompetitonDB(trans, insertSportsman, insertSportsman[0], 0, compId) : '',
                await deleteSportsmanFromCompetitionDB(trans, deleteSportsman, deleteSportsman[0], 0, compId)
                    .then((result) => {
                        //sendEmail(users);
                        ans.status = Constants.statusCode.ok;
                        ans.results = Constants.msg.registerSuccess;
                        trans.commitTransaction();
                    })
                    .catch((err) => {
                        console.log("bad")
                        ans.status = Constants.statusCode.badRequest;
                        ans.results = err;
                        trans.rollbackTransaction();
                    }))
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })

    return ans

}

function fixCategoryExcelData(data) {
    let regSportsman = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].length > 1) {
            if (data[i][Constants.colRegisterCompetitionExcel.category1] != "" && data[i][Constants.colRegisterCompetitionExcel.category1] != undefined)
                regSportsman.push({
                    id: data[i][Constants.colRegisterCompetitionExcel.idSportsman],
                    category: data[i][Constants.colRegisterCompetitionExcel.category1].charAt(data[i][Constants.colRegisterCompetitionExcel.category1].length - 2)
                });
            if (data[i][Constants.colRegisterCompetitionExcel.category2] != "" && data[i][Constants.colRegisterCompetitionExcel.category2] != undefined)
                regSportsman.push({
                    id: data[i][Constants.colRegisterCompetitionExcel.idSportsman],
                    category: data[i][Constants.colRegisterCompetitionExcel.category2].charAt(data[i][Constants.colRegisterCompetitionExcel.category2].length - 2)
                });
            if (data[i][Constants.colRegisterCompetitionExcel.category3] != "" && data[i][Constants.colRegisterCompetitionExcel.category3] != undefined)
                regSportsman.push({
                    id: data[i][Constants.colRegisterCompetitionExcel.idSportsman],
                    category: data[i][Constants.colRegisterCompetitionExcel.category3].charAt(data[i][Constants.colRegisterCompetitionExcel.category3].length - 2)
                });
        }
    }
    return regSportsman;
}

async function regExcelSportsmenCompDB(sportsmen, compId) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await excelInsertSportsmanToCompetitonDB(trans, sportsmen, sportsmen[0], 0, compId))
                .then((result) => {
                    ans.status = Constants.statusCode.ok;
                    ans.results = Constants.msg.registerSuccess;
                    trans.commitTransaction();
                })
                .catch((error) => {
                    ans.status = Constants.statusCode.badRequest;
                    ans.results = err;
                    console.log(error)
                    trans.rollbackTransaction();
                })
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            console.log(err)

            trans.rollbackTransaction();
        })

    return ans
}

async function excelDelSportsmenDB(sportsmem, compId) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await deleteExcelSportsmanFromCompetitionDB(trans, sportsmem, sportsmem[0], 0, compId))
                .then((result) => {
                    ans.status = Constants.statusCode.ok;
                    ans.results = Constants.msg.registerSuccess;
                    trans.commitTransaction();
                })
                .catch((error) => {
                    ans.status = Constants.statusCode.badRequest;
                    ans.results = err;
                    console.log(error)
                    trans.rollbackTransaction();
                })
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            console.log(err)

            trans.rollbackTransaction();
        });

    return ans

}

async function excelInsertSportsmanToCompetitonDB(trans, insertSportsman, sportsmanDetails, i, compId) {
    if (sportsmanDetails != undefined) {
        return trans.sql(`INSERT INTO competition_sportsman (idCompetition, idSportsman, category) Values (@compId,@id,@category)`)
            .parameter('compId', tediousTYPES.Int, compId)
            .parameter('id', tediousTYPES.Int, sportsmanDetails.id)
            .parameter('category', tediousTYPES.Int, sportsmanDetails.category)
            .execute()
            .then(async function (testResult) {
                if (i + 1 < insertSportsman.length) {
                    await excelInsertSportsmanToCompetitonDB(trans, insertSportsman, insertSportsman[i + 1], i + 1, compId)
                }
                return testResult
            })
    }
    return;
}

function deleteExcelSportsmanFromCompetitionDB(trans, sportsmem, sportsmenDetails, i, compId) {
    if (sportsmenDetails != undefined) {
        return trans.sql(`DELETE FROM competition_sportsman WHERE idCompetition=@compId and idSportsman = @id;`)
            .parameter('compId', tediousTYPES.Int, compId)
            .parameter('id', tediousTYPES.Int, sportsmenDetails.id)
            .execute()
            .then(async function (testResult) {
                await deleteExcelSportsmanFromCompetitionDB(trans, sportsmem, sportsmem[i + 1], i + 1, compId);
                return testResult
            });
    }
    return;
}

function getIdsForDelete(data) {
    let delSportsman = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].length > 1)
            delSportsman.push({
                id: data[i][Constants.colRegisterCompetitionExcel.idSportsman],
            });
    }
    return delSportsman;
}

function cheackExcelData(data, categoryData) {
    fixCategoryForCheck(categoryData);
    let ans = new Object();
    ans.results = [];
    let i = 0;
    for (let i = 0; i < data.length; i++) {
        if (data[i].length > 1) {
            if (data[i][Constants.colRegisterCompetitionExcel.category1].length > 0 && (data[i][Constants.colRegisterCompetitionExcel.category2].length > 0))
                if (data[i][Constants.colRegisterCompetitionExcel.category1] === (data[i][Constants.colRegisterCompetitionExcel.category2]))
                    ans.results.push({
                        id: data[i][Constants.colRegisterCompetitionExcel.idSportsman],
                        error: "category 1 ,2 are the same"
                    });
            if (data[i][Constants.colRegisterCompetitionExcel.category1].length > 0 && (data[i][Constants.colRegisterCompetitionExcel.category3].length > 0))

                if (data[i][Constants.colRegisterCompetitionExcel.category1] === (data[i][Constants.colRegisterCompetitionExcel.category3]))
                    ans.results.push({
                        id: data[i][Constants.colRegisterCompetitionExcel.idSportsman],
                        error: "category 1 ,3 are the same"
                    });
            if (data[i][Constants.colRegisterCompetitionExcel.category2].length > 0 && (data[i][Constants.colRegisterCompetitionExcel.category3].length > 0))
                if (data[i][Constants.colRegisterCompetitionExcel.category2] === (data[i][Constants.colRegisterCompetitionExcel.category3]))
                    ans.results.push({
                        id: data[i][Constants.colRegisterCompetitionExcel.idSportsman],
                        error: "category 2,3 are the same"
                    });
                /*
            if (data[i][Constants.colRegisterCompetitionExcel.category1].length > 0)

            if (data[i][Constants.colRegisterCompetitionExcel.category2].length > 0 )

                if (data[i][Constants.colRegisterCompetitionExcel.category3].length > 0)


                 */
        }
    }
    if (ans.results > 0)
        ans.pass = false;
    else
        ans.pass = true;
    console.log(ans)
}

function fixCategoryForCheck(data) {
    let categoryMap = new Map();
    for(let i = 0 ; i<data.length;i++)
        categoryMap.set(data[i].id,{minAge: data[i].minAge ,maxAge : data[i].maxAge ? data[i].maxAge : 100  });

    return (categoryMap);

}
module.exports.cheackExcelData = cheackExcelData;
module.exports.getIdsForDelete = getIdsForDelete;
module.exports.excelDelSportsmenDB = excelDelSportsmenDB;
module.exports.regExcelSportsmenCompDB = regExcelSportsmenCompDB;
module.exports.fixCategoryExcelData = fixCategoryExcelData;
module.exports.getDetail = getDetails;
module.exports.registerSportsmenToCompetition = registerSportsmenToCompetition;
