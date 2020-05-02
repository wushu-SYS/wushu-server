const clubs_functions = require("../common/sportclub_module")
const comFunc = require("../commonFunc")
const constants = require("../../constants")

async function getClubTree(clubId) {
    let clubsData = await getClubData(clubId)
    if (clubsData) {
        let coaches = Array.from(new Set(clubsData.map(club => club.coachId))).map(coachId => {
            let currCoach = clubsData.find(c => c.coachId == coachId)
            return {
                id: coachId,
                firstName: currCoach.coachFirstName,
                lastName: currCoach.coachLastName,
                photo: currCoach.coachPhoto
            }
        });
        let coachSportsmen = [];
        coaches.forEach(coach => {
            coachSportsmen.push({
                coach: coach,
                sportsman: clubsData.filter(club => club.coachId == coach.id)
            })
        })

        let ans = new Object();
        ans.status = constants.statusCode.ok;
        ans.result = coachSportsmen
        return ans;
    }
    clubsData.status = constants.statusCode.badRequest;
    clubsData.result = undefined
    return clubsData
}

async function getClubData(clubId) {
    let ans = new Object();
    await dbUtils.sql(`select user_Coach.id as coachId, user_Coach.firstname as coachFirstName, user_Coach.lastname as coachLastName, user_Coach.photo as coachPhoto, user_Sportsman.id as sportsmanId, user_Sportsman.firstname as sportsmanFirstName, user_Sportsman.lastname as sportsmanLastName, user_Sportsman.photo as sportsmanPhoto from user_Coach
                        join sportsman_coach on user_Coach.id = sportsman_coach.idCoach
                        join user_Sportsman on sportsman_coach.idSportman = user_Sportsman.id
                        where user_Coach.sportclub = @sportsClubId`)
        .parameter('sportsClubId', tediousTYPES.Int, clubId)
        .execute()
        .then((results) => {
            ans = results;
        })
        .catch((err) => {
            ans = undefined
            console.log(err)
        })
    return ans;
}

async function getClubParticipateSportsmanCompetitions(clubId) {
    let ans = new Object();
    await dbUtils.sql(`select numComps, count(*) as count from
                        (select (select count(compCount) as sportsmanComp from(
                       SELECT COUNT(*) as compCount
                       FROM competition_sportsman
                        join events_competition
                        on competition_sportsman.idCompetition = events_competition.idCompetition
                        join events
                        on events_competition.idEvent = events.idEvent
                        WHERE competition_sportsman.idSportsman = id
                        and date >= datefromparts(@year, 9, 1)
                        group by events_competition.idCompetition) as tmp) as numComps from user_Sportsman where sportclub = @sportClubId) as tmp2
                        group by numComps`)
        .parameter('sportClubId', tediousTYPES.Int, clubId)
        .parameter('year', tediousTYPES.Int, comFunc.getSessionYear())
        .execute()
        .then((results) => {
            ans.results = results;
            ans.status = constants.statusCode.ok
        })
        .catch((err) => {
            ans.results = undefined
            ans.status = constants.statusCode.badRequest
            console.log(err)
        })
    return ans;
}


module.exports.getClubTree = getClubTree
module.exports.getClubParticipateSportsmanCompetitions = getClubParticipateSportsmanCompetitions