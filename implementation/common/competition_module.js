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
                    await insertSportsmanToCompetitonDB(trans, insertSportsman, insertSportsman[i+1], i+1, compId)
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

function createExcel (){

}

module.exports.createExcel =createExcel;
module.exports.getDetail = getDetails;
module.exports.registerSportsmenToCompetition = registerSportsmenToCompetition;
