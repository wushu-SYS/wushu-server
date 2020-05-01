const clubs_functions = require("../common/sportclub_module")
const constants = require("../../constants")

async function getClubTree(clubId) {
    let clubsData = await getClubData(clubId)
    if(clubsData){
        let coaches = Array.from(new Set(clubsData.map(club => club.coachId))).map(coachId => {
            let currCoach = clubsData.find(c => c.coachId == coachId)
            return {
                id: coachId,
                firstName: currCoach.coachFirstName,
                lastName: currCoach.coachLastName
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
    clubsData.status=constants.statusCode.badRequest;
    clubsData.result = undefined
    return clubsData
}
async function getClubData(clubId){
    let ans = new Object();
    await dbUtils.sql(`select user_Coach.id as coachId, user_Coach.firstname as coachFirstName, user_Coach.lastname as coachLastName, user_Sportsman.id as sportsmanId, user_Sportsman.firstname as sportsmanFirstName, user_Sportsman.lastname as sportsmanLastName from user_Coach
                        join sportsman_coach on user_Coach.id = sportsman_coach.idCoach
                        join user_Sportsman on sportsman_coach.idSportman = user_Sportsman.id
                        where user_Coach.sportclub = @sportsClubId`)
        .parameter('sportsClubId', tediousTYPES.Int, clubId)
        .execute()
        .then((results) => {
            ans = results;
        })
        .catch((err) => {
            ans=undefined
            console.log(err)
        })
    return ans;
}

module.exports.getClubTree = getClubTree