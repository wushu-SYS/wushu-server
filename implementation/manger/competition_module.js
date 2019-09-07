
var status={
    close: 'סגור',
    open : 'פתוח',
    regclose :'רישום סגור'
}

function addCompetition(req, res) {
    DButilsAzure.execQuery(` INSERT INTO events (location,type,date,startHour)
                                    VALUES ('${req.body.location}','${eventType.competition}','${req.body.eventDate}','${req.body.startHour}');`)
        .then((result) => {
            DButilsAzure.execQuery(` INSERT INTO events_competition (branch,description,closeRegDate,closeRegTime,status)
                                    VALUES ('${req.body.branch}','${req.body.description}','${req.body.closeDate}','${req.body.closeTime}','${status.open}');`)

                .then((result1)=>{
                    res.status(200).send("Competition addded successfully")
                })
                .catch((eror)=>{res.status(400).send(eror)})
        })
        .catch((eror) => {res.status(400).send(eror)})
}

function editCompetition(req, res) {
    DButilsAzure.execQuery(` Update events 
                                    set location ='${req.body.location}',type='${eventType.competition}',date=''${req.body.eventDate}',startHour='${req.body.startHour}'
                                    where idEvent ='${req.body.eventId}';`)
        .then((result) => {
            DButilsAzure.execQuery(` Update events_competition 
                                            set branch=${req.body.branch},description='${req.body.description}',closeRegDate='${req.body.closeDate}',closeRegTime='${req.body.closeTime}',status=''${req.body.status}
                                            where idCompetition ='${req.body.idCompetition}';`)
                .then((result1)=>{
                    res.status(200).send("Competition update successfully")
                })
                .catch((eror)=>{res.status(400).send(eror)})
        })
        .catch((eror) => {res.status(400).send(eror)})
}

module.exports._addCompetition = addCompetition;
