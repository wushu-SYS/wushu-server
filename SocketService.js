let startedCompetition = [];

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
            io.in(`comp ${data.idComp}`).emit('masterStartCompetition', {idComp: data.idComp})
        }
    })
});