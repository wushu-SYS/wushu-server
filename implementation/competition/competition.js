const constants = require("../../constants")
tediousTYPES = require('tedious').TYPES;

async function updateCompetitionResultGrade(details) {
   let ans = new Object();
    await dbUtils.sql(`INSERT INTO competition_results (sportsmanID,compID,categoryID,grade)
                                    VALUES (@sportsmanID, @compID, @categoryID, @grade)`)
        .parameter('idCoach', tediousTYPES.Int, details.sportsmanID)
        .parameter('firstName',  tediousTYPES.Int, details.compID)
        .parameter('lastName',  tediousTYPES.Int, details.categoryID)
        .parameter('phone',  tediousTYPES.Float, details.grade)
        .execute()
        .then(result => {
            ans.results = {
                sportsmen: result
            };
            ans.status = constants.statusCode.ok;
        })
        .fail((error) => {
            ans.status = constants.statusCode.badRequest;
            ans.results = error;
        });
    return ans
}

