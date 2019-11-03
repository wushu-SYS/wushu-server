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

async function validateExcel(data) {
    let errorUsers = [];
    let res = new Object();
    res.isPassed = true;
    res.status = Constants.statusCode.ok;
    let line = 1;
    data.forEach(function (user) {
        let tmpErr = checkRow(user);
        if (tmpErr.errors.length > 0) {
            tmpErr.line = line;
            res.isPassed = false;
            res.status = Constants.statusCode.badRequest;
            errorUsers.push(tmpErr)
        }
        line++
    })
    res.results = errorUsers;
    console.log("return")
    return res;
}
 function checkRow(row) {
    let err = new Object()
    let collectErr = [];
    //id user
    if (!validator.isInt(row[Constants.colRegisterCompetitionExcel.idSportsman].toString(), {
        gt: 100000000,
        lt: 1000000000
    }))
        collectErr.push(Constants.errorMsg.idSportmanErr)
    //firstname
    if (!validator.matches(row[Constants.colRegisterCompetitionExcel.firstName].toString(), Constants.hebRegex) || row[Constants.colRegisterCompetitionExcel.firstName].toString().length < 2)
        collectErr.push(Constants.errorMsg.firstNameHeb)
    //lastname
    if (!validator.matches(row[Constants.colRegisterCompetitionExcel.lastName].toString(), Constants.hebRegex) || row[Constants.colRegisterCompetitionExcel.lastName].toString().length < 2)
        collectErr.push(Constants.errorMsg.lastNameHeb)

    err.errors = collectErr;
    return err;

}

/*
async function idMatchName (user){
    await dbUtils.sql(`select * from user_sportsman where id=@id and firstname like @firstname and lastname like @lastname`)
        .parameter('id', tediousTYPES.Int, row[Constants.colRegisterCompetitionExcel.idSportsman])
        .parameter('firstname', tediousTYPES.NVarChar, row[Constants.colRegisterCompetitionExcel.firstName])
        .parameter('lastname', tediousTYPES.NVarChar, row[Constants.colRegisterCompetitionExcel.lastName])
        .execute()
        .then(function (results) {
            if (results == 0)
                return false
        }).fail(function (err) {
            console.log(err)
        });
    return true

}

 */
async function registerExcelSportsmanToCompetition(sportsMan, compId) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await insertSportsmanToCompetitonExcelDB(trans, sportsMan, sportsMan[0], 0, compId)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = Constants.statusCode.ok;
                    ans.results = Constants.msg.registerSuccess;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    console.log(err);
                    ans.status = Constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                })
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        });
    return ans
}

async function insertSportsmanToCompetitonExcelDB(trans, insertSportsman, sportsmanDetails, i, compId) {

    if (sportsmanDetails != undefined) {
        await dbUtils.sql(`select id from category where name like @name`)
            .parameter('name', tediousTYPES.NVarChar, sportsmanDetails[Constants.colRegisterCompetitionExcel.category])
            .execute()
            .then(function (results) {
                return trans.sql(`INSERT INTO competition_sportsman (idCompetition, idSportsman, category)
                     SELECT * FROM (select @compId as idCompetition, @id as idSportsman, @category as category) AS tmp
                     WHERE NOT EXISTS (
                     SELECT idCompetition, idSportsman, category FROM competition_sportsman WHERE idCompetition = @compId and idSportsman = @id and category = @category)`)
                    .parameter('compId', tediousTYPES.Int, compId)
                    .parameter('id', tediousTYPES.Int, sportsmanDetails[Constants.colRegisterCompetitionExcel.idSportsman])
                    .parameter('category', tediousTYPES.NVarChar, results[0].id)
                    .execute()
                    .then(async function (testResult) {
                        if (i + 1 < insertSportsman.length) {
                            await insertSportsmanToCompetitonExcelDB(trans, insertSportsman, insertSportsman[i + 1], i + 1, compId)
                        }
                        return testResult
                    })
            }).fail(function (err) {
                console.log(err)
            });

    }
    return;
}

module.exports.registerExcelSportsmanToCompetition = registerExcelSportsmanToCompetition;
module.exports.validateExcel = validateExcel;
module.exports.getDetail = getDetails;
module.exports.registerSportsmenToCompetition = registerSportsmenToCompetition;
