function getDetails(req ,res) {
    console.log(req)
    DButilsAzure.execQuery(`select events_competition.idCompetition,events_competition.description,events_competition.sportStyle ,events_competition.status ,events_competition.closeRegDate, events_competition.closeRegTime, events.date ,events.location, events.startHour, events.city from events_competition
                                   left join events on events_competition.idEvent = events.idEvent
                                   where idCompetition= ${req.body.id}`)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((eror) => {res.status(400).send(eror)})
}
function registerSportsmenToCompetition(req, res){
    let queryStack = [];
    req.body.insertSportsman.forEach(function (sportsmanIdCategory) {
        queryStack.push(DButilsAzure.execQuery(`INSERT INTO competition_sportsman (idCompetition, idSportsman, category)
                                    SELECT * FROM (select ${req.body.compId} as idCompetition, ${sportsmanIdCategory.id} as idSportsman, ${sportsmanIdCategory.category} as category) AS tmp
                                    WHERE NOT EXISTS (
                                        SELECT idCompetition, idSportsman, category FROM competition_sportsman WHERE idCompetition = ${req.body.compId} and idSportsman = ${sportsmanIdCategory.id} and category = ${sportsmanIdCategory.category}
                                    )`));
    });
    req.body.deleteSportsman.forEach(function (sportsmanIdCategory) {
        queryStack.push(DButilsAzure.execQuery(`DELETE FROM competition_sportsman WHERE idCompetition=${req.body.compId} and idSportsman = ${sportsmanIdCategory.id} and category = ${sportsmanIdCategory.category};`));
    });
    Promise.all(queryStack)
        .then(result => {res.status(200).send("Successful registration");})
        .catch(error => { res.status(404).send(error)});

}

module.exports._getDetail= getDetails;
module.exports._registerSportsmenToCompetition = registerSportsmenToCompetition;
