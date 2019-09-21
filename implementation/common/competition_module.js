function getDetails(req ,res) {
    console.log(req)
    DButilsAzure.execQuery(`select events_competition.idCompetition,events_competition.sportStyle ,events_competition.status, events.date ,events.location, events.startHour, events.city from events_competition
                                   left join events on events_competition.idEvent = events.idEvent
                                   where idCompetition= ${req.body.id}`)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((eror) => {res.status(400).send(eror)})
}
function registerSportsmenToCompetition(req, res){
    // let valuesStack = [];
    // req.body.sportsmenIds.forEach(function (sportsman) {
    //     valuesStack.push("(" + req.body.compId + "," + sportsman + ")");
    // });
    // let stringArray = valuesStack.join(",");
    // DButilsAzure.execQuery(`insert into competition_sportsman (idCompetition, idSportsman) values ${stringArray}`)
    //     .then(result => { res.status(200).send("Successful registration"); })
    //     .catch(error => { res.status(404).send(error)})

    let queryStack = [];
    req.body.sportsmenIds.forEach(function (sportsmanId) {
        queryStack.push(DButilsAzure.execQuery(`INSERT INTO competition_sportsman (idCompetition, idSportsman)
                                    SELECT * FROM (select ${req.body.compId} as idCompetition, ${sportsmanId} as idSportsman) AS tmp
                                    WHERE NOT EXISTS (
                                        SELECT idCompetition, idSportsman FROM competition_sportsman WHERE idCompetition = ${req.body.compId} and idSportsman = ${sportsmanId}
                                    )`));
    })
    Promise.all(queryStack)
        .then(result => {res.status(200).send("Successful registration");})
        .catch(error => { res.status(404).send(error)});

}

module.exports._getDetail= getDetails;
module.exports._registerSportsmenToCompetition = registerSportsmenToCompetition;
