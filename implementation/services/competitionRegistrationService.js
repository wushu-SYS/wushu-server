const constants = require('../../constants')
const competitionSportsmanModule = require('../modules/competitionSportsmanModule')
const competitionJudgeModule = require('../modules/competitionJudgeModule')
const {dbConnection} = require("../../dbUtils");

function getIdsForDelete(data) {
    let delSportsman = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].length > 1)
            delSportsman.push({
                id: data[i][constants.colRegisterCompetitionExcel.idSportsman],
            });
    }
    return delSportsman;
}

async function deleteSportsmanFromCompetition(sportsmen, compId) {
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    await competitionSportsmanModule.deleteExcelSportsmanFromCompetitionDB(trans, sportsmen, sportsmen[0], 0, compId)
        .then((result) => {
            ans.pass = true;
            trans.commit;
        })
        .catch((error) => {
            console.log(error)
            ans.pass = true;
            ans.results = error;
            trans.rollback;
        })

    return ans

}

async function regExcelSportsmenCompDB(sportsmen, compId) {
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    await competitionSportsmanModule.excelInsertSportsmanToCompetitionDB(trans, sportsmen, sportsmen[0], 0, compId)
        .then((result) => {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.registerSuccess;
            trans.commit();
        })
        .catch((error) => {
            console.log(error)
            ans.status = constants.statusCode.badRequest;
            ans.results = error;
            trans.rollback();
        })

    return ans
}

async function registerSportsmenToCompetition(insertSportsman, deleteSportsman, updateSportsman, compId) {
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    if (!insertSportsman) insertSportsman = []
    await competitionSportsmanModule.insertSportsmanToCompetitionDB(trans, insertSportsman, insertSportsman[0], 0, compId)
        .then(async () => {
            await competitionSportsmanModule.deleteSportsmanFromCompetitionDB(trans, deleteSportsman, deleteSportsman[0], 0, compId)
                .then(async () => {
                    await competitionSportsmanModule.updateSportsmanInCompetitionDB(trans, updateSportsman, updateSportsman[0], 0, compId)
                        .then(async (result) => {
                            ans.status = constants.statusCode.ok;
                            ans.results = constants.msg.registerSuccess;
                            await trans.commit();
                            await reRangeCompetitionSportsman(compId)
                            //await sendRegisteredSportsmanMail(insertSportsman);
                        })
                })
        }).catch((err) => {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollback();
        })

    return ans

}

async function reRangeCompetitionSportsman(compId) {
    let sportsmanList = await getNewOldSportsmanRegisteredComp(compId)
    let sportsmanNew = sportsmanList.newSportsman;
    let sportsmanOld = sportsmanList.oldSportsman;
    if (sportsmanOld.length > 0) {
        sportsmanNew.forEach((sportsman) => {
            let newInd = sportsmanNew.lastIndexOf(sportsman.category == sportsmanOld.category)
            if (newInd != -1)
                sportsmanOld.splice(newInd + 1, 0, sportsman);
            else
                sportsmanOld.push(sportsman)
        })
    } else {
        sportsmanNew.sort((a, b) => (a.category > b.category) ? 1 : ((b.category > a.category) ? -1 : 0));
        sportsmanOld = sportsmanNew;
    }
    let indx = 0
    for (let i = 0; i < sportsmanOld.length; i++) {
        sportsmanOld[i].indx = indx;
        indx++;
    }
    await startUpdateIndexRegistrationTrans(compId, sportsmanOld)

}

async function getNewOldSportsmanRegisteredComp(compId) {
    let ans = new Object()
    ans.newSportsman = await competitionSportsmanModule.getNewSportsmanRegistrationComp(compId);
    ans.oldSportsman = await competitionSportsmanModule.getOldSportsmanRegistrationComp(compId);

    return ans

}

async function startUpdateIndexRegistrationTrans(compId, sportsman) {
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    await competitionSportsmanModule.updateIndexSportsmanRegistration(trans, sportsman, sportsman[0], 0, compId)
        .then(async (result) => {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.competitionUpdate;
            trans.commit();
        }).catch((err) => {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollback();
        })
    return ans

}

async function registerJudgeToCompetition(insertJudge, deleteJudge, compId, masterJudge) {
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    await competitionJudgeModule.insertJudgeToCompetitionDB(trans, insertJudge, insertJudge[0], 0, compId)
        .then(async () => {
            await competitionJudgeModule.deleteJudgeFromCompetitionDB(trans, deleteJudge, deleteJudge[0], 0, compId)
                .then(async () => {
                    await competitionJudgeModule.updateMasterToCompetition(trans, compId, masterJudge)
                        .then((result) => {
                            ans.status = constants.statusCode.ok;
                            ans.results = constants.msg.registerSuccess;
                            trans.commit();
                        })
                })
        }).catch((err) => {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollback();
        })
    return ans
}

async function deleteJudgesFromCompetition(compId, judges) {
    let ans = new Object()
    const trans = await dbConnection.getTransactionDb()
    await competitionJudgeModule.deleteJudgeFromCompetitionDB(trans, judges, judges[0], 0, compId)
        .then(async (result) => {
            ans.status = constants.statusCode.ok;
            ans.results = constants.msg.competitionUpdate;
            await trans.commit();
        }).catch((err) => {
            console.log(err)
            ans.status = constants.statusCode.badRequest;
            ans.results = err;
            trans.rollback();
        })

    return ans
}

module.exports.getIdsForDelete = getIdsForDelete
module.exports.deleteSportsmanFromCompetition = deleteSportsmanFromCompetition
module.exports.regExcelSportsmenCompDB = regExcelSportsmenCompDB
module.exports.registerSportsmenToCompetition = registerSportsmenToCompetition
module.exports.registerJudgeToCompetition = registerJudgeToCompetition
module.exports.deleteJudgesFromCompetition = deleteJudgesFromCompetition
