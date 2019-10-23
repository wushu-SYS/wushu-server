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

function initQuery(queryData) {
    let query = `select events_competition.idCompetition,events_competition.sportStyle ,events_competition.status,events_competition.closeRegDate, events.date from events_competition
                                   left join events on events_competition.idEvent = events.idEvent`;
    let queryCount = `select count(*) as count from events_competition 
                        left join events on events_competition.idEvent = events.idEvent`;
    let whereStat = buildConditions_forGetCompetitions(queryData);
    query += whereStat;
    queryCount += whereStat;
    query += ` order by events.date`;
    return {query, queryCount};
}

async function getCompetitions(queryData) {
    let ans = new Object();
    let query = initQuery(queryData);
    await Promise.all([
        dbUtils.sql(query.query)
            .parameter('location', tediousTYPES.NVarChar, queryData.location)
            .parameter('sportStyle', tediousTYPES.NVarChar, queryData.sportStyle)
            .parameter('Value0', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[0] ? queryData.status.split(',')[0] : '')
            .parameter('Value1', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[1] ? queryData.status.split(',')[1] : '')
            .parameter('Value2', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[2] ? queryData.status.split(',')[2] : '')
            .execute()
            .fail((error) => {
                ans.status = Constants.statusCode.badRequest;
                ans.results = error;
            }),
        dbUtils.sql(query.queryCount)
            .parameter('location', tediousTYPES.NVarChar, queryData.location)
            .parameter('sportStyle', tediousTYPES.NVarChar, queryData.sportStyle)
            .parameter('Value0', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[0] ? queryData.status.split(',')[0] : '')
            .parameter('Value1', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[1] ? queryData.status.split(',')[1] : '')
            .parameter('Value2', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[2] ? queryData.status.split(',')[2] : '')
            .execute()
            .fail((error) => {
                ans.status = Constants.statusCode.badRequest;
                ans.results = error;
            })])
        .then(result => {
            ans.results = {
                sportsmen: result[0],
                totalCount: result[1][0].count
            };
            ans.status = Constants.statusCode.ok;
        })
        .catch((error) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = error;
        });
    return ans;
}

function buildConditions_forGetCompetitions(queryData) {
    let location = queryData.location;
    let sportStyle = queryData.sportStyle;
    let status = queryData.status;
    var conditions = [];

    if (location !== '' && location !== undefined) {
        conditions.push("(events.city like Concat('%', @location, '%') or events.location like Concat('%',  @location, '%'))");
    }
    if (sportStyle !== '' && sportStyle !== undefined) {
        conditions.push("events_competition.sportStyle like @sportStyle");
    }
    if (status !== '' && status !== undefined) {
        conditions.push("events_competition.status in (" + status.split(',').map((val, index) => `@Value${index}`).join(',') + ")");
    }
    return conditions.length ? ' where ' + conditions.join(' and ') : '';
}

function getAllSportsman(req, res) {
    DButilsAzure.execQuery(`select id,firstname,lastname from user_Sportsman`)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((err) => {
            res.status(400).send(err)
        })
}

async function getRegistrationState(compId) {
    let ans = new Object();
    await dbUtils.sql(`Select user_Sportsman.id, firstname, lastname, category, c.name as categoryName, user_Sportsman.sex, FLOOR(DATEDIFF(DAY, birthdate, getdate()) / 365.25) as age, sportclub
                    from user_Sportsman
                    join competition_sportsman
                    on user_Sportsman.id = competition_sportsman.idSportsman
                    left join category as c
                    on competition_sportsman.category = c.id
                    where competition_sportsman.idCompetition = @compId
                    order by age, firstname`)
        .parameter('compId', tediousTYPES.Int, compId)
        .execute()
        .then((results) => {
            ans.status = Constants.statusCode.ok;
            ans.results = sortUsers(results)
        })
        .fail((err) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        })
    return ans;
}

function sortUsers(users) {
    let resultJson = [];
    users.sort(
        function (obj1, obj2) {
            let x = obj1.category ? obj1.category : Number.NEGATIVE_INFINITY;
            let y = obj2.category ? obj2.category : Number.NEGATIVE_INFINITY;
            return x - y;
        });
    let usedCategories = Array.from(new Set(users.map(u => u.category))).map(id => ({
        id: id,
        name: id != null ? users.find(u => u.category == id).categoryName : 'ללא קטגוריה'
    }));
    let i = 0;
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

function setCategoryRegistration(req, res) {
    let queryStack = [];
    req.body.categoryForSportsman.forEach(function (categorySportsman) {
        queryStack.push(DButilsAzure.execQuery(`update competition_sportsman
                                                        set category = ${categorySportsman.categoryId}
                                                        where idSportsman = ${categorySportsman.sportsmanId} and idCompetition = ${req.body.compId}`));
    });
    Promise.all(queryStack)
        .then(result => {
            res.status(200).send("Successful update");
        })
        .catch(error => {
            res.status(404).send(error)
        });
}

async function closeRegistration(idCompetition) {
    let ans = new Object();
    await dbUtils.sql(`update events_competition set status = @status where idCompetition = @idCompetition`)
        .parameter('status', tediousTYPES.NVarChar, Constants.competitionStatus.regclose)
        .parameter('idCompetition', tediousTYPES.Int, idCompetition)
        .execute()
        .then((results) => {
            ans.status = Constants.statusCode.ok;
            ans.results = results;
        })
        .fail((error) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = error;
        })
    return ans;
}

function addNewCategory(req, res) {
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

async function updateCompetitionDetails(competitionDetails, idEvent) {
    var ans = new Object();
    var trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`Update events_competition 
                                     set sportStyle=@sportStyle,description=@description,closeRegDate=@closeRegDate,closeRegTime=@closeRegTime
                                     where idCompetition =@competitionId;`)
                .parameter('sportStyle', tediousTYPES.NVarChar, competitionDetails.sportStyle)
                .parameter('description', tediousTYPES.NVarChar, competitionDetails.description)
                .parameter('closeRegDate', tediousTYPES.Date, competitionDetails.closeRegDate)
                .parameter('closeRegTime', tediousTYPES.Time, competitionDetails.closeRegTime)
                .parameter('competitionId', tediousTYPES.Int, competitionDetails.competitionId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`Update events 
                                    set location =@location,type=@type,date=@eventDate,startHour=@evetTime
                                    where idEvent =@idEvent;`)
                .parameter('idEvent', tediousTYPES.Int, idEvent)
                .parameter('location', tediousTYPES.NVarChar, competitionDetails.location)
                .parameter('type', tediousTYPES.Int, Constants.eventType.competition)
                .parameter('eventDate', tediousTYPES.Date, competitionDetails.eventDate)
                .parameter('evetTime', tediousTYPES.Time, competitionDetails.evetTime)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.competitionUpdate;
            trans.commitTransaction();
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans;
}

function autoCloseRegCompetition() {
    console.log('Start auto closed Register to Competition');
    dbUtils.sql(`UPDATE events_competition SET status='${Constants.competitionStatus.regclose}' WHERE closeRegDate<=Convert(Date,CURRENT_TIMESTAMP) and closeRegTime<=Convert(TIME,CURRENT_TIMESTAMP) and status='${Constants.competitionStatus.open}';`)
        .execute()
        .then(function (results) {
            console.log("Finished auto closed register to competitions")
        }).fail(function (err) {
        console.log(err)
    });
}

async function getIdEvent(idComp) {
    await dbUtils.sql(`select idEvent from events_competition where idCompetition =@idComp;`)
        .parameter('idComp', tediousTYPES.Int, idComp)
        .execute()
        .then(function (results) {
            return results[0].idEvent;
        }).fail(function (err) {
            console.log(err)
        });
}

module.exports._addCompetition = addCompetition;
module.exports.getCompetitions = getCompetitions;
module.exports._getAllSportsman = getAllSportsman;
module.exports.getRegistrationState = getRegistrationState;
module.exports._setCategoryRegistration = setCategoryRegistration;
module.exports.closeRegistration = closeRegistration;
module.exports._addNewCategory = addNewCategory;
module.exports.updateCompetitionDetails = updateCompetitionDetails;
module.exports.autoCloseRegCompetition = autoCloseRegCompetition;
module.exports.getIdEvent = getIdEvent;