const constants = require("../../constants")
const common_functions = require("../commonFunc")

async function getParticipateSportsManCompetitions(sportsmanId) {
    let res = new Object();
    res.allComp = await getCountSessionCompetition(common_functions.getSessionYear())
    res.sportsmanCompCount = await getCountSportsmanCompetition(common_functions.getSessionYear(), sportsmanId)
    res.notParticipate = parseInt(res.allComp) - parseInt(res.sportsmanCompCount)
    res.status = 200;
    if (!res.allComp || !res.sportsmanCompCount)
        res.status = 400;

    return res;

}

async function getCountSessionCompetition(year) {
    let ans = new Object();
    await dbUtils.sql(`SELECT COUNT(idCompetition) as allComp
                       from events_competition
                       join events
                       on events_competition.idEvent = events.idEvent
                       WHERE date >= datefromparts(@year, 9, 1)`)
        .parameter('year', tediousTYPES.Int, year)
        .execute()
        .then(function (results) {
            ans = results[0].allComp
        }).catch((err) => {
            console.log(err)
            ans = undefined
        })
    return ans;
}

async function getCountSportsmanCompetition(year, sportsmanId) {
    let ans = new Object();
    await dbUtils.sql(`select sum(compCount) as sportsmanComp from(
                       SELECT COUNT(*) as compCount
                       FROM competition_sportsman
                        join events_competition
                        on competition_sportsman.idCompetition = events_competition.idCompetition
                        join events
                        on events_competition.idEvent = events.idEvent
                        WHERE competition_sportsman.idSportsman = @sportsmanId
                        and date >= datefromparts(@year, 9, 1)
                        group by events_competition.idCompetition) as tmp`)
        .parameter('year', tediousTYPES.Int, year)
        .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
        .execute()
        .then(function (results) {
            ans = results[0].sportsmanComp
        }).catch((err) => {
            console.log(err)
            ans = undefined
        })
    return ans;

}

module.exports.getParticipateSportsManCompetitions = getParticipateSportsManCompetitions
