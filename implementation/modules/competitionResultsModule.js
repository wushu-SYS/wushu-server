const constants = require('../../constants')

async function getCompetitionResultById(compId) {
    let res = new Object();
    await dbUtils.sql(`Select user_Sportsman.id, firstname, lastname, category, c.name as categoryName, c.minAge as minAge, c.maxAge as maxAge, c.sex as categorySex, user_Sportsman.sex, FLOOR(DATEDIFF(DAY, birthdate, getdate()) / 365.25) as age, sportclub, indx, isnull(grade, 0) as finalGrade
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    left join category as c
                    on competition_sportsman.category = c.id
                    right join competition_results
                    on competition_results.compID = competition_sportsman.idCompetition and competition_results.sportmanID = competition_sportsman.idSportsman and competition_results.categoryID = competition_sportsman.category
                    where competition_sportsman.idCompetition = @compId
                    order by indx`)
        .parameter('compId', tediousTYPES.Int, compId)
        .execute()
        .then((results) => {
            res.status = constants.statusCode.ok
            let sorted = commonFunc.sortUsers(results);
            sorted.forEach(categorySportsman => categorySportsman.users.sort((s1, s2) => s2.finalGrade - s1.finalGrade));
            res.results = sorted;
        })
        .fail((err) => {
            res.results = err;
            res.status = constants.statusCode.badRequest
        });
    return res

}

async function getSportsmanRank(sportsmanId) {
    let ans = new Object();
    await dbUtils.sql(`select avg(grade) as rank from competition_results where sportmanID = @sportsmanId`)
        .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

async function insertSportsmanFinalGrade(trans, finalGrade, details) {
    return await trans.sql(`insert into competition_results (sportmanID, compID, categoryID, grade) VALUES  (@sportsmanId , @compId,@categoryId,@grade)`)
        .parameter('sportsmanId', tediousTYPES.Int, details.idSportsman)
        .parameter('compId', tediousTYPES.Int, details.idComp)
        .parameter('categoryId', tediousTYPES.Int, details.idCategory)
        .parameter('grade', tediousTYPES.Float, finalGrade)
        .execute()
        .then(async function (testResult) {
            return testResult
        })
}
async function updateSportsmanCompetitionGrade(trans,sportsman,sportsmanDetails,i,compId){
    return trans.sql(`update competition_results set grade =@grade where compID =@compId and sportmanID=@sportsmanId and categoryID = @categoryId`)
        .parameter('sportsmanId', tediousTYPES.Int, sportsmanDetails.sportsmanId)
        .parameter('compId',  tediousTYPES.Int, compId)
        .parameter('categoryId',  tediousTYPES.Int, sportsmanDetails.categoryId)
        .parameter('grade',  tediousTYPES.Float, sportsmanDetails.grade)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < sportsman.length)
                await updateSportsmanCompetitionGrade(trans, sportsman, sportsman[i + 1], i + 1,compId)
            return testResult
        })
}


module.exports.getCompetitionResultById = getCompetitionResultById
module.exports.getSportsmanRank = getSportsmanRank
module.exports.insertSportsmanFinalGrade = insertSportsmanFinalGrade
module.exports.updateSportsmanCompetitionGrade = updateSportsmanCompetitionGrade