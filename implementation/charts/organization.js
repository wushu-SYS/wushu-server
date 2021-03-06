const constants = require("../../constants")
const clubs_chart = require("./clubs")
const sportClubsModule = require("../modules/sportClubModule")


async function getWushuTree() {
    let ans = new Object()
    ans.results = []
    let clubs = await sportClubsModule.getSportClubs()
    clubs = clubs.results
    for (const club of clubs) {
        let data = await clubs_chart.getClubTree(club.id)
        if (data.status == constants.statusCode.ok)
            ans.results.push({
                club: club,
                data: data.result
            })
        else {
            ans.status = constants.statusCode.badRequest;
            ans.results = undefined
        }
    }
    ans.status= constants.statusCode.ok
    return ans
}

module.exports.getWushuTree = getWushuTree