const constants = require('../../constants')
const commonFunc = require("../commonFunc");
const dbConnection = require('../../dbUtils').dbConnection

async function getCompetitionResultById(compId) {
    let res = new Object();
    await dbConnection.query({
        sql: `Select user_Sportsman.id, firstname, lastname, category, c.name as categoryName, c.minAge as minAge, c.maxAge as maxAge, c.sex as categorySex, user_Sportsman.sex, FLOOR(DATEDIFF(now(), birthdate) / 365.25) as age, sportclub, indx, ifnull(grade, 0) as finalGrade
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    left join category as c
                    on competition_sportsman.category = c.id
                    right join competition_results
                    on competition_results.compID = competition_sportsman.idCompetition and competition_results.sportmanID = competition_sportsman.idSportsman and competition_results.categoryID = competition_sportsman.category
                    where competition_sportsman.idCompetition = :compId
                    order by indx`,
        params: {
            compId: compId
        }
    }).then((results) => {
        res.status = constants.statusCode.ok
        let sorted = commonFunc.sortUsers(results.results);
        sorted.forEach(categorySportsman => categorySportsman.users.sort((s1, s2) => s2.finalGrade - s1.finalGrade));
        res.results = sorted;
    }).catch((err) => {
        console.log(err)
        res.results = err;
        res.status = constants.statusCode.badRequest
    });
    return res

}

async function getSportsmanRank(sportsmanId) {
    let ans = new Object();
    await dbConnection.query({
        sql: `select avg(grade) as avg_rank from competition_results where sportmanID = :sportsmanId`,
        params: {
            sportsmanId: sportsmanId
        }
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

async function insertSportsmanFinalGrade(trans, finalGrade, details) {
    return await trans.query({
        sql: `insert into competition_results (sportmanID, compID, categoryID, grade) VALUES  (:sportsmanId , :compId,:categoryId,:grade)`,
        params: {
            sportsmanId: details.idSportsman,
            compId: details.idComp,
            categoryId: details.idCategory,
            grade: finalGrade
        }
    }).catch((err) => {
        console.log(err)
    })
}

async function updateSportsmanCompetitionGrade(trans, sportsman, sportsmanDetails, i, compId) {
    return trans.query({
        sql: `update competition_results set grade =:grade where compID =:compId and sportmanID=:sportsmanId and categoryID = :categoryId`,
        params: {
            sportsmanId: sportsmanDetails.sportsmanId,
            compId: compId,
            categoryId: sportsmanDetails.categoryId,
            grade: sportsmanDetails.grade
        }
    }).then(async function () {
        if (i + 1 < sportsman.length)
            await updateSportsmanCompetitionGrade(trans, sportsman, sportsman[i + 1], i + 1, compId)
    })
}


module.exports.getCompetitionResultById = getCompetitionResultById
module.exports.getSportsmanRank = getSportsmanRank
module.exports.insertSportsmanFinalGrade = insertSportsmanFinalGrade
module.exports.updateSportsmanCompetitionGrade = updateSportsmanCompetitionGrade