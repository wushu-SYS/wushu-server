const constants = require("../../constants")
const common_functions = require("../commonFunc")
const dbConnection = require('../../dbUtils').dbConnection

async function getParticipateSportsManCompetitions(sportsmanId) {
    let res = new Object();
    res.allComp = await getCountSessionCompetition(common_functions.getSessionYear())
    res.sportsmanCompCount = await getCountSportsmanCompetition(common_functions.getSessionYear(), sportsmanId)
    if (res.allComp==undefined || res.sportsmanCompCount ==undefined) {
        res.status = 400;
        return res
    }
    res.notParticipate = parseInt(res.allComp) - parseInt(res.sportsmanCompCount)
    res.status = 200;
    return res;

}

async function getCountSessionCompetition(year) {
    let ans = new Object();
    await dbConnection.query({
        sql: `SELECT COUNT(idCompetition) as allComp
                       from events_competition
                       join events
                       on events_competition.idEvent = events.idEvent
                       WHERE date >= STR_TO_DATE(CONCAT(:year,'-',LPAD(9,2,'00'),'-',LPAD(1,2,'00')), '%Y-%m-%d')`,
        params: {
            year: year
        }
    }).then(function (results) {
        ans = results.results[0].allComp
    }).catch((err) => {
        console.log(err)
        ans = undefined
    })
    return ans;
}

async function getCountSportsmanCompetition(year, sportsmanId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `select COUNT(compCount) as sportsmanComp from(
                       SELECT COUNT(*) as compCount
                       FROM competition_sportsman
                        join events_competition
                        on competition_sportsman.idCompetition = events_competition.idCompetition
                        join events
                        on events_competition.idEvent = events.idEvent
                        WHERE competition_sportsman.idSportsman = :sportsmanId
                        and date >= STR_TO_DATE(CONCAT(:year,'-',LPAD(9,2,'00'),'-',LPAD(1,2,'00')), '%Y-%m-%d')
                        group by events_competition.idCompetition) as tmp`,
        params: {
            year: year,
            sportsmanId: sportsmanId
        }
    }).then(function (results) {
        ans = results.results[0].sportsmanComp
    }).catch((err) => {
        console.log(err)
        ans = undefined
    })
    return ans;

}

async function getSportsmanRecords(sportsmanId) {
    let res = new Object();
    let grades = await getSportsmanGrades(common_functions.getSessionYear(), sportsmanId)
    if (!grades) {
        res.status = 400;
        return res
    }
    res.categories = [...new Set(grades.map(grade => grade.name))]
    res.resultes = grades;
    res.status = 200;

    return res;
}

async function getSportsmanGrades(year, sportsmanId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `SELECT compID, date,categoryID, name, grade
                        FROM competition_results
                        join events_competition
                        on compID = events_competition.idCompetition
                        join events
                        on events_competition.idEvent = events.idEvent
                        join category on competition_results.categoryID = category.id
                        WHERE sportmanID = :sportsmanId
                        and date >= STR_TO_DATE(CONCAT(:year,'-',LPAD(9,2,'00'),'-',LPAD(1,2,'00')), '%Y-%m-%d')`,
        params: {
            year: year,
            sportsmanId: sportsmanId
        }
    }).then(function (results) {
        ans = results.results
    }).catch((err) => {
        console.log(err)
        ans = undefined
    })
    return ans;

}

async function getSportsmanJudgeRecords(sportsmanId) {
    let res = new Object();
    let grades = await getSportsmanJudgeGrades(common_functions.getSessionYear(), sportsmanId)
    if (!grades) {
        res.status = 400;
        return res
    }
    res.categories = []
    grades.forEach((grade) => {
        let a = {id: grade.categoryId, name: grade.name}
        if (!res.categories.some(item => item.id == a.id))
            res.categories.push(a)
    })
    res.resultes = grades;
    res.status = 200;

    return res;
}

async function getSportsmanJudgeGrades(year, sportsmanId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `SELECT compID, date,categoryID, judgeId, firstname as judgeFirstName, lastname as judgeLastName, name, grade
                        FROM competition_Judgment
                        join events_competition
                        on compID = events_competition.idCompetition
                        join events
                        on events_competition.idEvent = events.idEvent
                        join category on competition_Judgment.categoryID = category.id
                        join user_Judge on user_Judge.id = competition_Judgment.judgeId
                        WHERE sportsmanId = :sportsmanId
                        and date >= STR_TO_DATE(CONCAT(:year,'-',LPAD(9,2,'00'),'-',LPAD(1,2,'00')), '%Y-%m-%d')`,
        params: {
            year: year,
            sportsmanId: sportsmanId
        }
    }).then(function (results) {
        ans = results.results
    }).catch((err) => {
        console.log(err)
        ans = undefined
    })
    return ans;
}


module.exports.getParticipateSportsManCompetitions = getParticipateSportsManCompetitions
module.exports.getSportsmanRecords = getSportsmanRecords
module.exports.getSportsmanJudgeRecords = getSportsmanJudgeRecords
