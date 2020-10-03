const competitionJudgeModule = require("./implementation/modules/competitionJudgeModule");
let connectedUsers = new Map();
let startedCompetition = new Map();
let nextSportsmanInCompetition = [];
let competitionFinalsGrade = new Map()


io.on('connection', (client) => {
    client.on('login', function (data) {
        console.log(`[LOG]-user with id ${data.userId} connected to the server , client id = ${client.id} `)
        connectedUsers.set(parseInt(data.userId), client.id);
    });
    client.on('disconnect', function (data) {
        connectedUsers.delete(data.userId)
    });
    client.on('judgeEnterToCompetition', function (data) {
        console.log(`[LOG]-judge with client id ${client.id} enter to judge comp ${data.idComp} `);
        connectedUsers.set(parseInt(data.userId), client.id);
    });


    client.on('judgeMasterEnterToCompetition', async function (data) {
        console.log(`[LOG]-judge master with client id ${client.id} start to competition ${data.idComp}`);
        connectedUsers.set(parseInt(data.userId), client.id);
        let judges = (await competitionJudgeModule.getRegisteredJudgeForCompetition(data.idComp)).results;
        startedCompetition.set(data.idComp, {judges: judges, masterJudge: data.userId});
        competitionFinalsGrade.set(data.idComp, [])
        judges.forEach((judge) => {
            let clientId = connectedUsers.get(parseInt(data.userId))
            if (clientId != undefined) {
                console.log(`[LOG]-judge master with client id ${client.id} send to judge ${clientId} that comp ${data.idComp} started`)
            }
        })
    });

    client.on('isCompetitionStart', function (data) {
        console.log(`[LOG]-judge with client id ${client.id} ask for competitions user id ${data.userId} `)
        connectedUsers.set(parseInt(data.userId), client.id);
        startedCompetition.forEach((comp, key) => {
            let judges = comp.judges;
            judges.forEach((judge) => {
                if (judge.idJudge == data.userId) {
                    let clientId = connectedUsers.get(parseInt(data.userId))
                    if (clientId != undefined)
                        io.to(clientId).emit('masterStartCompetition', {idComp: key})
                }
            })
        })
    })

    client.on('setNextSportsman', function (data) {
        connectedUsers.set(parseInt(data.userId), client.id);
        if (data.sportsman.id)
            console.log(`[LOG]- next sportsman in comp ${data.idComp} is ${data.sportsman.id}`)
        let nextSportsman = new Object();
        nextSportsman.idComp = data.idComp;
        nextSportsman.sportsman = data.sportsman;
        nextSportsman.category = data.category;
        let preSportsman = nextSportsmanInCompetition.findIndex(x => x.idComp === data.idComp);
        if (preSportsman != -1)
            nextSportsmanInCompetition.splice(preSportsman, 1);
        nextSportsmanInCompetition.push(nextSportsman);
    });

    client.on('whoIsNextSportsman', function (data) {
        connectedUsers.set(parseInt(data.userId), client.id);
        console.log(`[LOG]-judge with client id ${client.id} ask for next Sportsman `)
        let nextSportsman = nextSportsmanInCompetition.find(x => x.idComp === data.idComp);
        console.log(`[LOG]- next sportsman for comp id ${data.idComp} is ${nextSportsman.sportsman.id}`)
        io.to(client.id).emit('nextSportsman', {sportsman: nextSportsman.sportsman, category: nextSportsman.category})
    })

    client.on('judgeGiveGrade', function (data) {
        connectedUsers.set(parseInt(data.userId), client.id);
        console.log(`[LOG]-judge with id ${data.userId} give grade to sportsman  `)
        let masterJudge = (startedCompetition.get(data.idComp)).masterJudge
        io.to(connectedUsers.get(parseInt(masterJudge))).emit('judgeGiveGrade', {
            userId: data.userId,
            grade: data.grade
        });

    })

    client.on("masterJudgeSaveGrade", function (data) {
        connectedUsers.set(parseInt(data.userId), client.id);
        let sportsmanGrades = competitionFinalsGrade.get(data.idComp)
        sportsmanGrades.push(data.sportsman)
        competitionFinalsGrade.set(data.idComp, sportsmanGrades)
    })

    client.on("competitionFinalsGrades",function (data) {
        connectedUsers.set(parseInt(data.userId), client.id);
        let sportsmanGrades = competitionFinalsGrade.get(data.idComp)
        io.to(connectedUsers.get(parseInt(data.userId))).emit('competitionFinalsGradesResults', sportsmanGrades)

        })

    client.on('judgeMasterCloseCompetition', async function (data) {
        console.log(`[LOG]-judge master with client id ${client.id} close competition ${data.idComp}`);
        connectedUsers.set(parseInt(data.userId), client.id);
        startedCompetition.delete(data.idComp)
        competitionFinalsGrade.delete(data.idComp)
    });

});