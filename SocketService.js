let startedCompetition = [];
let nextSportsmanInCompetition=[] ;
io.on('connection', (client) => {
    client.on('login', function (data) {
        console.log(`[LOG]-user with id ${data.userId} connected to the server , client id = ${client.id} `)
    });

    client.on('judgeEnterToCompetition', function (data) {
        console.log(`[LOG]-judge with client id ${client.id} enter to judge comp ${data.idComp} `);
        client.join(`comp ${data.idComp}`)
    });

    client.on('judgeMasterEnterToCompetition', function (data) {
        console.log(`[LOG]-judge master with client id ${client.id} start to competition ${data.idComp}`);
        client.to(`comp ${data.idComp}`).emit('masterStartCompetition', {idComp: data.idComp})
        startedCompetition.push(data.idComp)
    })

    client.on('isCompetitionStart', function (data) {
        console.log(`[LOG]-judge with client id ${client.id} ask if comp ${data.idComp} start `)
        if (startedCompetition.includes(data.idComp)) {
            console.log(`[LOG]-comp ${data.idComp} has been started`)
            io.to(client.id).emit('masterStartCompetition', {idComp: data.idComp})
        }
    })

    client.on('setNextSportsman',function (data) {
        if(data.sportsman.id)
            console.log(`[LOG]- next sportsman in comp ${data.idComp} is ${data.sportsman.id}`)
        let nextSportsman = new Object();
        nextSportsman.idComp = data.idComp;
        nextSportsman.sportsman = data.sportsman;
        nextSportsman.category = data.category;
        let preSportsman = nextSportsmanInCompetition.findIndex(x => x.idComp === data.idComp);
        if(preSportsman!= -1 )
            nextSportsmanInCompetition.splice(preSportsman,1);
        nextSportsmanInCompetition.push(nextSportsman);
    });

    client.on('whoIsNextSportsman',function (data) {
        console.log(`[LOG]-judge with client id ${client.id} ask for next Sportsman `)
        let nextSportsman = nextSportsmanInCompetition.find(x => x.idComp === data.idComp);
        console.log(`[LOG]- next sportsman for comp id ${data.idComp} is ${nextSportsman.sportsman.id}`)
        io.to(client.id).emit('nextSportsman',{sportsman : nextSportsman.sportsman,category: nextSportsman.category})
    })


});