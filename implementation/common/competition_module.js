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
module.exports._getDetail= getDetails;
