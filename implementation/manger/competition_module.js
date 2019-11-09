function validateCompetitionDetails(eventDetails) {
    let ans = new Object();
    ans.isPassed = true;
    let err = [];
    //description
    if (!validator.matches(eventDetails.description, Constants.regexHebWithSpace))
        err.push(Constants.errorMsg.hebErr)
    //location
    if (!validator.matches(eventDetails.location, Constants.regexHebrewAndNumbers))
        err.push(Constants.errorMsg.hebErr)
    //branch
    if (!(eventDetails.sportStyle in Constants.sportType))
        err.push(Constants.errorMsg.sportTypeErr)
    //city
    if (!validator.matches(eventDetails.city, Constants.regexHebWithSpace))
        err.push(Constants.errorMsg.hebErr)

    if (err.length != 0)
        ans.isPassed = false;
    ans.results = err;
    return ans;
}

async function addCompetition(competitionDetails) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(` INSERT INTO events (location,type,date,startHour,city)
                                     output inserted.idEvent
                                    VALUES (@location,@eventType,@eventDate,@startHour,@city);`)
                .parameter('location', tediousTYPES.NVarChar, competitionDetails.location)
                .parameter('eventType', tediousTYPES.NVarChar, Constants.eventType.competition)
                .parameter('eventDate', tediousTYPES.Date, competitionDetails.eventDate)
                .parameter('startHour', tediousTYPES.NVarChar, competitionDetails.startHour)
                .parameter('city', tediousTYPES.NVarChar, competitionDetails.city)
                .execute();
        })
        .then(async function (Result) {
            return await trans.sql(` INSERT INTO events_competition (sportStyle,description,closeRegDate,closeRegTime,status,idEvent)
                                    VALUES (@sportStyle,@description,@closeDate,@closeTime,@status,@idEvent);`)
                .parameter('sportStyle', tediousTYPES.NVarChar, competitionDetails.sportStyle)
                .parameter('description', tediousTYPES.NVarChar, competitionDetails.description)
                .parameter('closeDate', tediousTYPES.Date, competitionDetails.closeDate)
                .parameter('closeTime', tediousTYPES.NVarChar, competitionDetails.closeTime)
                .parameter('status', tediousTYPES.NVarChar, Constants.competitionStatus.open)
                .parameter('idEvent', tediousTYPES.Int, Result[0].idEvent)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.eventAdded;
            trans.commitTransaction();
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans;
    /*let validator = new validation(req.body, {
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

     */
}

function initQuery(queryData) {
    let query = `select * from (select ROW_NUMBER() OVER (order by events.date) AS rowNum, events_competition.idCompetition,events_competition.sportStyle ,events_competition.status,events_competition.closeRegDate, events.date from events_competition
                                   left join events on events_competition.idEvent = events.idEvent`;
    let queryCount = `select count(*) as count from events_competition 
                        left join events on events_competition.idEvent = events.idEvent`;
    let whereStatement = buildConditions_forGetCompetitions(queryData);
    query += whereStatement.conditionsStatement;
    queryCount += whereStatement.conditionsStatement;
    query += `) tmp` + whereStatement.limits;
    return {query, queryCount};
}

async function getCompetitions(queryData) {
    let ans = new Object();
    let query = initQuery(queryData);
    await dbUtils.sql(query.query)
        .parameter('location', tediousTYPES.NVarChar, queryData.location)
        .parameter('sportStyle', tediousTYPES.NVarChar, queryData.sportStyle)
        .parameter('Value0', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[0] ? queryData.status.split(',')[0] : '')
        .parameter('Value1', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[1] ? queryData.status.split(',')[1] : '')
        .parameter('Value2', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[2] ? queryData.status.split(',')[2] : '')
        .parameter('startIndex', tediousTYPES.NVarChar, queryData.startIndex)
        .parameter('endIndex', tediousTYPES.NVarChar, queryData.endIndex)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = results
        })
        .fail((error) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = error;
        });
    return ans;
}

async function getCompetitionsCount(queryData) {
    let ans = new Object();
    let query = initQuery(queryData);
    await dbUtils.sql(query.queryCount)
        .parameter('location', tediousTYPES.NVarChar, queryData.location)
        .parameter('sportStyle', tediousTYPES.NVarChar, queryData.sportStyle)
        .parameter('Value0', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[0] ? queryData.status.split(',')[0] : '')
        .parameter('Value1', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[1] ? queryData.status.split(',')[1] : '')
        .parameter('Value2', tediousTYPES.NVarChar, queryData.status && queryData.status.split(',')[2] ? queryData.status.split(',')[2] : '')
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = results[0]
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

function buildConditions_forGetCompetitions(queryData) {
    let location = queryData.location;
    let sportStyle = queryData.sportStyle;
    let status = queryData.status;
    let startIndex = queryData.startIndex;
    let endIndex = queryData.endIndex;
    var conditions = [];
    var limits;

    if (location !== '' && location !== undefined) {
        conditions.push("(events.city like Concat('%', @location, '%') or events.location like Concat('%',  @location, '%'))");
    }
    if (sportStyle !== '' && sportStyle !== undefined) {
        conditions.push("events_competition.sportStyle like @sportStyle");
    }
    if (status !== '' && status !== undefined) {
        conditions.push("events_competition.status in (" + status.split(',').map((val, index) => `@Value${index}`).join(',') + ")");
    }
    if(startIndex !== '' && startIndex !== undefined && endIndex != '' && endIndex !== undefined) {
        limits = ' where rowNum >= @startIndex and rowNum <= @endIndex';
    }
    let conditionsStatement = conditions.length ? ' where ' + conditions.join(' and ') : '';
    return {conditionsStatement, limits};
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

async function setCategoryRegistration(categoryForSportsman, compId) {
    console.log(categoryForSportsman);
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await insertCategoryRegistrationDB(trans, categoryForSportsman, categoryForSportsman[0], 0, compId)
                .then((result) => {
                    ans.status = Constants.statusCode.ok;
                    ans.results = Constants.msg.categoryRegistrationSuccess;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = Constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                })
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        });

    return ans
}

async function insertCategoryRegistrationDB(trans, categoryForSportsman, category, i, compID) {
    return trans.sql(`update competition_sportsman
                      set category = @category
                      where idSportsman = @idSportsman and idCompetition = @idCompetition`)
        .parameter('idSportsman', tediousTYPES.Int, category[0])
        .parameter('category', tediousTYPES.Int, category[1])
        .parameter('idCompetition', tediousTYPES.Int, compID)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < categoryForSportsman.length)
                await insertCategoryRegistrationDB(trans, categoryForSportsman, categoryForSportsman[i + 1], i + 1, compID);
            return testResult
        })
}

async function closeRegistration(idCompetition) {
    let ans = new Object();
    await dbUtils.sql(`update events_competition set status = @status where idCompetition = @idCompetition`)
        .parameter('status', tediousTYPES.NVarChar, Constants.competitionStatus.regclose)
        .parameter('idCompetition', tediousTYPES.Int, idCompetition)
        .execute()
        .then((results) => {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.closeRegistration;
        })
        .fail((error) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = error;
        })
    return ans;
}


function validateDataBeforeAddCategory(newCategory) {
    let res = new Object();
    res.isPassed = true;
    let err = validateCategory(newCategory)
    if (err.length != 0) {
        res.status = Constants.statusCode.badRequest;
        res.isPassed = false;
        res.results = err;
    }
    return res;
}

function validateCategory(newCategory) {
    var err = [];
    //category Name
    if (!validator.matches(newCategory.categoryName, Constants.hebRegex))
        err.push(Constants.errorMsg.idSportmanErr);
    //minAge
    if (!validator.isInt(newCategory.minAge.toString(), {min: 0, max: 100}))
        err.push(Constants.errorMsg.compAgeErr);
    //maxAge
    if (!validator.isInt(newCategory.maxAge.toString(), {min: 0, max: 100}))
        err.push(Constants.errorMsg.compAgeErr);
    //sex
    if (!(newCategory.sex in Constants.sexEnum))
        err.push(Constants.errorMsg.sexErr);
    //min < max
    if (newCategory.minAge > newCategory.maxAge)
        err.push(Constants.errorMsg.minAgeErr);

    return err;
}

async function addNewCategory(categoryDetails) {
    let ans = new Object();
    await dbUtils.sql(`INSERT INTO category (name,minAge,maxAge,sex)
                      VALUES (@categoryName,@minAge,@maxAge,@sex);`)
        .parameter('categoryName', tediousTYPES.NVarChar, categoryDetails.categoryName)
        .parameter('minAge', tediousTYPES.Int, categoryDetails.minAge)
        .parameter('maxAge', tediousTYPES.Int, categoryDetails.maxAge)
        .parameter('sex', tediousTYPES.NVarChar, categoryDetails.sex)
        .execute()
        .then((results) => {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.addCategory;
        })
        .fail((error) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = error;
        })
    return ans;
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
                .parameter('closeRegDate', tediousTYPES.NVarChar, competitionDetails.closeRegDate)
                .parameter('closeRegTime', tediousTYPES.NVarChar, competitionDetails.closeRegTime)
                .parameter('competitionId', tediousTYPES.Int, competitionDetails.competitionId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            console.log("here")
            return await trans.sql(`Update events 
                                    set location =@location,type=@type,date=@eventDate,startHour=@evetTime, city=@city
                                    where idEvent =@idEvent;`)
                .parameter('idEvent', tediousTYPES.Int, idEvent)
                .parameter('location', tediousTYPES.NVarChar, competitionDetails.location)
                .parameter('type', tediousTYPES.NVarChar, Constants.eventType.competition)
                .parameter('eventDate', tediousTYPES.NVarChar, competitionDetails.eventDate)
                .parameter('evetTime', tediousTYPES.NVarChar, competitionDetails.evetTime)
                .parameter('city', tediousTYPES.NVarChar, competitionDetails.city)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            console.log("good")
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.competitionUpdate;
            trans.commitTransaction();
        })
        .fail(function (err) {
            console.log("bad")
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
    let res;
    await dbUtils.sql(`select idEvent from events_competition where idCompetition =@idComp;`)
        .parameter('idComp', tediousTYPES.Int, idComp)
        .execute()
        .then(function (results) {
            res = results[0].idEvent;
        }).fail(function (err) {
            console.log(err)
        });
    return res;
}

module.exports.addCompetition = addCompetition;
module.exports.getCompetitions = getCompetitions;
module.exports.getCompetitionsCount = getCompetitionsCount;
module.exports._getAllSportsman = getAllSportsman;
module.exports.getRegistrationState = getRegistrationState;
module.exports.setCategoryRegistration = setCategoryRegistration;
module.exports.closeRegistration = closeRegistration;
module.exports.addNewCategory = addNewCategory;
module.exports.updateCompetitionDetails = updateCompetitionDetails;
module.exports.autoCloseRegCompetition = autoCloseRegCompetition;
module.exports.getIdEvent = getIdEvent;
module.exports.validateDataBeforeAddCategory = validateDataBeforeAddCategory;
module.exports.validateCompetitionDetails = validateCompetitionDetails;