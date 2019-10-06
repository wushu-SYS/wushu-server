
var status={
    close: 'סגור',
    open : 'פתוח',
    regclose :'רישום סגור'
}

function addCompetition(req, res) {
    let validator = new validation(req.body, {
        location: 'required',
        eventDate: 'required',
        startHour: 'required',
        sportStyle: 'required',
        closeDate: 'required',
        closeTime: 'required',
        description: 'required',
        city: 'required'
    });
    var regexHebrew = new RegExp("^[\u0590-\u05fe _]*[\u0590-\u05fe][\u0590-\u05fe _]*$");
    var regexHebrewAndNumbers = new RegExp("^[\u0590-\u05fe0-9 _]*[\u0590-\u05fe0-9][\u0590-\u05fe0-9 _]*$");
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(400).send(validator.errors);
        } else if (!regexHebrew.test(req.body.description)) {
            res.status(400).send("Description name must be in hebrew");
        } else if (!regexHebrewAndNumbers.test(req.body.location)) {
            res.status(400).send("Location name must be in hebrew");
        } else if (req.body.eventDate.split("/").length != 3) {
            res.status(400).send("The eventDate must be a valid date");
        } else if (req.body.startHour.split(":").length != 2) {
            res.status(400).send("The startHour must be a valid date");
        } else if (req.body.closeDate.split("/").length != 3) {
            res.status(400).send("The closeDate must be a valid date");
        } else if (req.body.closeTime.split(":").length != 2) {
            res.status(400).send("The closeTime must be a valid date");
        } else if (req.body.sportStyle != 'טאולו' && req.body.sportStyle != 'סנדא') {
            res.status(400).send("The sportStyle must be valid");
        } else if (!regexHebrewAndNumbers.test(req.body.city)) {
            res.status(400).send("city name must be in hebrew");
        } else {
            DButilsAzure.execQuery(` INSERT INTO events (location,type,date,startHour,city)
                                    output inserted.idEvent
                                    VALUES ('${req.body.location}','${eventType.competition}','${req.body.eventDate}','${req.body.startHour}','${req.body.city}');`)
                .then((result) => {
                    DButilsAzure.execQuery(` INSERT INTO events_competition (sportStyle,description,closeRegDate,closeRegTime,status,idEvent)
                                    VALUES ('${req.body.sportStyle}','${req.body.description}','${req.body.closeDate}','${req.body.closeTime}','${status.open}','${result[0].idEvent}');`)

                        .then((result1) => {
                            res.status(200).send("Competition addded successfully")
                        })
                        .catch((eror) => {
                            res.status(400).send(eror)
                        })
                })
                .catch((eror) => {
                    res.status(400).send(eror)
                })
        }
    })
}

function getCompetitions(req ,res){
    let query = `select events_competition.idCompetition,events_competition.sportStyle ,events_competition.status,events_competition.closeRegDate, events.date from events_competition
                                   left join events on events_competition.idEvent = events.idEvent`;
    let queryCount = `select count(*) as count from events_competition 
                        left join events on events_competition.idEvent = events.idEvent`;
    let whereStat = buildConditions_forGetCompetitions(req);
    query += whereStat;
    queryCount += whereStat;
    query += ` order by events.date`;

    Promise.all([DButilsAzure.execQuery(query), DButilsAzure.execQuery(queryCount)])
        .then(result => {
            resultJson = {
                competitions : result[0],
                totalCount : result[1][0].count
            };
            res.status(200).send(resultJson);
        })
        .catch((error) => {
            res.status(400).send(error)
        });
}
function buildConditions_forGetCompetitions(req){
    let location = req.query.location;
    let sportStyle = req.query.sportStyle;
    let status = req.query.status;
    console.log(req.query.status);
    var conditions = [];

    if(location !== '' && location !== undefined) {
        conditions.push("(events.city like '%" + location + "%' or events.location like '%" + location + "%')");
    }
    if(sportStyle !== '' && sportStyle !== undefined){
        conditions.push("events_competition.sportStyle like '" + sportStyle + "'");
    }
    if(status !== '' && status !== undefined){
        let statusCond = [];
        status.split(',').forEach(s => {
            statusCond.push("events_competition.status like '" + s + "'");
        });
        conditions.push("(" + statusCond.join(' or ') + ")");
    }
    return conditions.length ? ' where ' + conditions.join(' and ') : '';
}

function getAllSportsman(req,res){
     DButilsAzure.execQuery(`select id,firstname,lastname from user_Sportsman`)
         .then((result) => {
             res.status(200).send(result)
         })
         .catch((err) => {res.status(400).send(err)})
}

function getRegistrationState(req, res){
    DButilsAzure.execQuery(`Select user_Sportsman.id, firstname, lastname, category, c.name as categoryName, user_Sportsman.sex, FLOOR(DATEDIFF(DAY, birthdate, getdate()) / 365.25) as age
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    left join category as c
                    on competition_sportsman.category = c.id
                    where competition_sportsman.idCompetition = ${req.body.compId}
                    order by age, firstname`)
        .then((result) => {
            res.status(200).send(sortUsers(result))
        })
        .catch((err) => {res.status(400).send(err)})
}
function sortUsers(users) {
    let resultJson = [];
    users.sort(
        function(obj1, obj2){
            let x = obj1.category ? obj1.category : Number.NEGATIVE_INFINITY;
            let y = obj2.category ? obj2.category : Number.NEGATIVE_INFINITY;
            return x-y;
        });
    let usedCategories = Array.from(new Set(users.map(u => u.category))).map(id => ({id:id, name: id!=null ? users.find(u => u.category == id).categoryName : 'ללא קטגוריה'}));
    let i=0;
    usedCategories.forEach(category => {
        let categoryUsers = {
            category: category,
            users: []
        };
        while (i < users.length && category.name === (users[i].categoryName ? users[i].categoryName : 'ללא קטגוריה')) {
            categoryUsers.users.push(users[i]);
            i++;
        }
        resultJson.push(categoryUsers);
    });
    return resultJson;
}

function setCategoryRegistration(req, res){
    let queryStack = [];
    req.body.categoryForSportsman.forEach(function (categorySportsman) {
        queryStack.push(DButilsAzure.execQuery(`update competition_sportsman
                                                        set category = ${categorySportsman.categoryId}
                                                        where idSportsman = ${categorySportsman.sportsmanId} and idCompetition = ${req.body.compId}`));
                                                });
    Promise.all(queryStack)
        .then(result => {res.status(200).send("Successful update");})
        .catch(error => { res.status(404).send(error)});
}

function closeRegistration(req, res){
    DButilsAzure.execQuery(`update events_competition set status = '${status.regclose}' where idCompetition = ${req.body.idComp}`)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((err) => {res.status(400).send(err)})
}

function addNewCategory(req,res) {
    let validator = new validation(req.body, {
        categoryName: 'required',
        minAge: 'required',
        maxAge: 'required',
        sex: 'required'
    });
    var regexHebrewAndNumbers = new RegExp("^[\u0590-\u05fe0-9 _]*[\u0590-\u05fe0-9][\u0590-\u05fe0-9 _]*$");
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(400).send(validator.errors);
        } else if (!regexHebrewAndNumbers.test(req.body.categoryName)) {
            res.status(400).send("name must be in hebrew and numbers only");
        } else {
            DButilsAzure.execQuery(` INSERT INTO category (name,minAge,maxAge,sex)
                                    VALUES ('${req.body.categoryName}','${req.body.minAge}','${req.body.maxAge}','${req.body.sex}');`)
                .then((result) => {
                    res.status(200).send(result)
                })
                .catch((err) => {
                    res.status(400).send(err)
                })
        }
    });
}

async function updateCompetitionDetails(req,res) {
  await  DButilsAzure.execQuery(` Update events_competition 
                                            set sportStyle='${req.body.sportStyle}',description='${req.body.description}',closeRegDate='${req.body.closeRegDate}',closeRegTime='${req.body.closeRegTime}'
                                            where idCompetition ='${req.body.competitionId}';`)
        .then(async (result) => {
           await DButilsAzure.execQuery(`select idEvent from events_competition where idCompetition ='${req.body.competitionId}';`)
               .then(async (result1)=>{
                   await DButilsAzure.execQuery(`Update events 
                                    set location ='${req.body.location}',type='${eventType.competition}',date='${req.body.eventDate}',startHour='${req.body.evetTime}'
                                    where idEvent ='${result1[0].idEvent}';`)
                       .then((result2) => {
                           res.status(200).send("Competition update successfully")
                       })
                       .catch((eror) => {
                           res.status(400).send("1 "+eror)
                       })
               })
               .catch((eror) => {
                   res.status(400).send(eror)
               })
        })
      .catch((eror) => {
          res.status(400).send(eror)
      })

}

function autoCloseRegCompetition(){
    DButilsAzure.execQuery(`UPDATE events_competition SET status='סגור' WHERE closeRegDate<=Convert(Date,CURRENT_TIMESTAMP) and closeRegTime<=Convert(TIME,CURRENT_TIMESTAMP);`)
            .then((result) => {})
        .catch((error)=>{
            console.log(eror)
        })
}

module.exports._addCompetition = addCompetition;
module.exports._getCompetitions =getCompetitions;
module.exports._getAllSportsman =getAllSportsman;
module.exports._getRegistrationState = getRegistrationState;
module.exports._setCategoryRegistration = setCategoryRegistration;
module.exports._closeRegistration = closeRegistration;
module.exports._addNewCategory = addNewCategory;
module.exports._updateCompetitionDetails = updateCompetitionDetails;
module.exports._autoCloseRegCompetition =autoCloseRegCompetition;