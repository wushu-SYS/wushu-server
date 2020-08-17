const constants =require("../../constants")
async function getCoaches() {
    let ans = new Object();
    await dbUtils.sql(`Select * from user_Coach`)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

async function getCoachProfileById(id) {
    let ans = new Object();
    await dbUtils.sql(`Select * from user_Coach Where id= @idCoach`)
        .parameter('idCoach', tediousTYPES.Int, id)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results[0]
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}


async function getCoachesNotRegisterAsJudges() {
    let ans = new Object();
    await dbUtils.sql(`select * from user_Coach except (select user_Coach.* from user_Coach join user_Judge on user_Coach.id = user_Judge.id) `)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
        });
    return ans;
}

module.exports.getCoaches = getCoaches;
module.exports.getCoachProfileById=getCoachProfileById;
module.exports.getCoachesNotRegisterAsJudges=getCoachesNotRegisterAsJudges;
