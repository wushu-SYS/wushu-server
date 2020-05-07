DButilsAzure = require('./dBUtils');
Constants = require('./constants');
let express = require('express');
let app = express();
let server = require('http').createServer(app);
io = require('socket.io')(server);

let bodyParser = require("body-parser");
let cors = require('cors');
jwt = require("jsonwebtoken");
validator = require('validator');
let formidable = require('formidable');
let fs = require("fs");
const util = require('util');

secret = "wushuSecret";
let schedule = require('node-schedule');

global.__basedir = __dirname;
let id, access;
bcrypt = require('bcryptjs');
saltRounds = 10;

//---------------------------------------------Google-Drive-------------------------------------------------------------
const googleDrive = require("./implementation/services/googleDrive/googleDriveService");
let googleDriveCredentials = (fs.readFileSync('./implementation/services/googleDrive/credentials.json'));
googleDriveCredentials = JSON.parse(googleDriveCredentials);
let authGoogleDrive = googleDrive.authorize(googleDriveCredentials);


//----------------------------------------------------------------------------------------------------------------------
//import all modules
const common_couches_module = require("./implementation/common/coaches_module");
const common_sportclub_module = require("./implementation/common/sportclub_module");
const common_sportsman_module = require("./implementation/common/sportsman_module");
const common_user_module = require("./implementation/common/user_module");
const common_competition_module = require("./implementation/common/competition_module");
const common_judge_module = require("./implementation/common/judge_module");

const coach_sportsman_module = require("./implementation/coach/sportsman_module");
const coach_user_module = require("./implementation/coach/user_module");

const manger_sportsman_module = require("./implementation/manger/sportsman_module");
const manger_user_module = require("./implementation/manger/user_module");
const manger_competition_module = require("./implementation/manger/competition_module");
const manager_judge_module = require("./implementation/manger/judge_module");
const manger_sportclub_module = require("./implementation/manger/sportClub_module");

const sportsman_user_module = require("./implementation/sportsman/user_module");
const master_judge_module = require("./implementation/judge/masterJudge");

const sportsman_charts = require("./implementation/charts/sportsman")
const club_charts = require("./implementation/charts/clubs")
const organization_charts = require("./implementation/charts/organization")

//dont delete this
const socketService = require("./SocketService");

const msg_board = require("./implementation/manger/msg_board")
const events = require("./implementation/manger/events")

common_function = require("./implementation/commonFunc");
const excelCreation = require("./implementation/services/excelCreation");
const userVaildationService = require("./implementation/services/userValidations/userValidationService");
const competitionValidationService = require("./implementation/services/competitionValidations/competitionValidationService");

let statusCode = {
    ok: 200,
    created: 201,
    accepted: 202,
    badRequest: 400,
    unauthorized: 401,
    notFound: 404,
    Conflict: 409,
    initialServerError: 500
};


//---------------------------------------server schedule Jobs-----------------------------------------------------------
//TODO :ASK TZVI for time of schedule at the end of the project

let automaticCloseCompetition = schedule.scheduleJob({minute: 600}, function () {
    manger_competition_module.autoCloseRegCompetition();
});
let automaticOpenCompetitionToJudge = schedule.scheduleJob({minute: 30}, function () {
    manger_competition_module.autoOpenCompetitionToJudge()

})
let autoReminderForUploadCriminalRecord = schedule.scheduleJob({dayOfWeek: 0, hour: 12}, function () {
    manager_judge_module.autoReminderForUploadCriminalRecord()
        .then(() => console.log("[Log] -autoReminderForUploadCriminalRecord succeed")).catch((error => console.log(error)))

})


//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------app uses----------------------------------------------------------------------
app.use(bodyParser.urlencoded({extend: true}));
app.use(bodyParser.json());
app.use(cors());
app.use("/private", (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) res.status(statusCode.unauthorized).send("Access denied. No token provided.");
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;

        access = jwt.decode(req.header("x-auth-token")).access;
        id = jwt.decode(req.header("x-auth-token")).id;

        next();
    } catch (exception) {
        res.status(statusCode.badRequest).send("Invalid token. Permission denied");
    }
});
app.use("/private/manager", (req, res, next) => {
    if (access === Constants.userType.MANAGER)
        next();
    else
        res.status(Constants.statusCode.unauthorized).send(Constants.errorMsg.accessDenied);
});
app.use("/private/sportsman", (req, res, next) => {
    if (access === Constants.userType.SPORTSMAN)
        next();
    else
        res.status(Constants.statusCode.unauthorized).send(Constants.errorMsg.accessDenied);


});
app.use("/private/coach", (req, res, next) => {
    if (access === Constants.userType.COACH)
        next();
    else
        res.status(Constants.statusCode.unauthorized).send(Constants.errorMsg.accessDenied);


});
app.use("/private/judge", (req, res, next) => {
    if (access === Constants.userType.JUDGE || access === Constants.userType.MANAGER)
        next();
    else
        res.status(Constants.statusCode.unauthorized).send(Constants.errorMsg.accessDenied);


});
app.use("/private/allUsers", (req, res, next) => {
    if (access === Constants.userType.SPORTSMAN || access === Constants.userType.MANAGER || access === Constants.userType.COACH || access == Constants.userType.JUDGE)
        next();
    else
        res.status(Constants.statusCode.unauthorized).send(Constants.errorMsg.accessDenied);
});
app.use("/private/commonCoachManager", (req, res, next) => {
    if (access === Constants.userType.MANAGER || access === Constants.userType.COACH || access == Constants.userType.JUDGE)
        next();
    else
        res.status(Constants.statusCode.unauthorized).send(Constants.errorMsg.accessDenied);
});


//----------------------------------------------------------------------------------------------------------------------
//-----------------------------------------app options------------------------------------------------------------------

app.options('*', cors());

//----------------------------------------------------------------------------------------------------------------------

//--------------------------------------------Login---------------------------------------------------------------------
app.post("/loginFirstStep", async (req, res) => {
    let ans = await common_user_module.checkUserDetailsForLogin(req.body);
    if (!ans.isPassed)
        res.status(statusCode.unauthorized).send(ans.err);
    else
        res.status(statusCode.ok).send(ans)
});
app.post("/loginSecondStep", async (req, res) => {
    if (!req.body)
        res.status(statusCode.unauthorized).send(ans.err);
    else {
        let ans = req.body;
        let userDetails = await common_user_module.getUserDetails(ans);
        let token = common_user_module.buildToken(userDetails, ans);
        res.status(statusCode.ok).send(token)
    }
});
// app.post("/login", async (req, res) => {
//     console.log("someone log in to the system")
//     let ans = await common_user_module.checkUserDetailsForLogin(req.body);
//     if (!ans.isPassed)
//         res.status(statusCode.unauthorized).send(ans.err);
//     else {
//         let userDetails = await common_user_module.getUserDetails(ans);
//         let token = common_user_module.buildToken(userDetails, ans);
//         res.status(statusCode.ok).send(token)
//     }
// });
app.post("/private/changePassword", async function (req, res) {
    let userData = {
        id: id,
        newPass: req.body.password
    }
    let ans = await common_user_module.validateDiffPass(userData);
    if (ans.isPassed) {
        ans = await common_user_module.changeUserPassword(userData);
        res.status(ans.status).send(ans.results)
    } else
        res.status(ans.status).send(ans.err)
});

//----------------------------------------------------------------------------------------------------------------------


//--------------------------------------------Register------------------------------------------------------------------
app.post("/private/commonCoachManager/registerSportsmenExcel", async function (req, res) {
    let usersToRegister = req.body;
    if (usersToRegister.length == 0)
        res.status(statusCode.badRequest).send({line: 0, errors: [Constants.errorMsg.emptyExcel]});
    else {
        let checkData = userVaildationService.checkExcelDataBeforeRegister(usersToRegister, "sportsman");
        if (checkData.isPassed) {
            let registerStatus = await coach_user_module.registerSportsman(checkData.users);
            res.status(registerStatus.status).send(registerStatus.results);
        } else
            res.status(statusCode.badRequest).send(checkData.results);
    }
});
app.post("/private/commonCoachManager/registerSportsmanManual", async function (req, res) {
    let user = req.body[0];
    let ans = await userVaildationService.checkDataBeforeRegister(user, "sportsman");
    if (ans.isPassed) {
        ans.users = common_function.getArrayFromJson(ans.users);
        ans = await coach_user_module.registerSportsman([ans.users]);
        res.status(ans.status).send(ans.results);
    } else
        res.status(statusCode.badRequest).send(ans.results);

});
app.post("/private/manager/registerCoachManual", async function (req, res) {
    let user = req.body[0];
    let ans = userVaildationService.checkDataBeforeRegister(user, "coach");
    if (ans.isPassed) {
        ans.users = common_function.getArrayFromJson(ans.users);
        ans = await manger_user_module.registerCoaches([ans.users]);
        res.status(ans.status).send(ans.results);

    } else
        res.status(statusCode.badRequest).send(ans.results);


})
app.post("/private/manager/registerCoachExcel", async function (req, res) {
    let usersToRegister = req.body;
    if (usersToRegister.length == 0)
        res.status(statusCode.badRequest).send({line: 0, errors: [Constants.errorMsg.emptyExcel]});
    else {
        let checkData = userVaildationService.checkExcelDataBeforeRegister(usersToRegister, "coach");
        if (checkData.isPassed) {
            let registerStatus = await manger_user_module.registerCoaches(checkData.users);
            res.status(registerStatus.status).send(registerStatus.results);
        } else
            res.status(statusCode.badRequest).send(checkData.results);
    }
});
app.post("/private/manager/registerJudgeManual", async function (req, res) {
    let ans;
    let user = req.body[0];
    ans = userVaildationService.checkDataBeforeRegister(user, "judge");
    if (ans.isPassed) {
        ans.users = common_function.getArrayFromJson(ans.users);
        ans = await manager_judge_module.registerNewJudge([ans.users]);
        res.status(ans.status).send(ans.results)
    } else
        res.status(Constants.statusCode.badRequest).send(ans.errors)
});
app.post("/private/commonCoachManager/regExcelCompetitionSportsmen", async function (req, res) {
    let ans;
    let sportsmenArr = common_function.getArrayFromJsonArray(req.body.sportsman);
    let categoryData = await common_sportsman_module.getCategories();
    let sportsmen = common_competition_module.fixCategoryExcelData(sportsmenArr);
    ans = common_competition_module.cheackExcelData(sportsmenArr, categoryData.results);
    if (sportsmenArr.length == 0)
        res.status(Constants.statusCode.badRequest).send([{error: Constants.errorMsg.emptyExcel}])
    else {
        if (ans.pass) {
            let delSportsman = common_competition_module.getIdsForDelete(sportsmenArr)
            ans = await common_competition_module.excelDelSportsmenDB(delSportsman, req.body.compId);
            if (ans.pass)
                ans = await common_competition_module.regExcelSportsmenCompDB(sportsmen, req.body.compId);

            res.status(ans.status).send(ans.results)
        } else
            res.status(Constants.statusCode.badRequest).send(ans.results)
    }
});
app.post("/private/manager/registerCoachAsJudge", async function (req, res) {
    let ans;
    let coachAsJudgeData = manager_judge_module.cleanCoachAsJudgeExcelData(common_function.getArrayFromJsonArray(req.body))
    ans = await manager_judge_module.registerCoachAsJudge(coachAsJudgeData);
    res.status(ans.status).send(ans.results)
})
app.post("/private/regExcelCompetitionSportsmen", async function (req, res) {
    let ans;
    if (access == Constants.userType.COACH || access == Constants.userType.MANAGER) {
        let sportsmenArr = common_function.getArrayFromJsonArray(req.body.sportsman);
        let categoryData = await common_sportsman_module.getCategories();
        let sportsmen = common_competition_module.fixCategoryExcelData(sportsmenArr);
        ans = common_competition_module.cheackExcelData(sportsmenArr, categoryData.results);
        if (sportsmenArr.length == 0)
            res.status(statusCode.badRequest).send([{error: Constants.errorMsg.emptyExcel}])
        else {
            if (ans.pass) {
                let delSportsman = common_competition_module.getIdsForDelete(sportsmenArr)
                ans = await common_competition_module.excelDelSportsmenDB(delSportsman, req.body.compId);
                if (ans.pass)
                    ans = await common_competition_module.regExcelSportsmenCompDB(sportsmen, req.body.compId);

                res.status(ans.status).send(ans.results)
            } else
                res.status(statusCode.badRequest).send(ans.results)
        }
    } else
        res.status(statusCode.badRequest).send(Constants.errorMsg.accessDenied);
})
app.post("/private/manager/registerAdmin", async function (req, res) {
    let ans = await manger_user_module.registerAdmin(req.body);
    res.status(ans.status).send(ans.results)
})

//----------------------------------------------------------------------------------------------------------------------

//---------------------------------------------Competition registration-------------------------------------------------
app.post("/private/commonCoachManager/competitionSportsmen", async function (req, res) {
    let ans = await common_competition_module.registerSportsmenToCompetition(req.body.insertSportsman, req.body.deleteSportsman, req.body.updateSportsman, req.body.compId);

    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/competitionJudge", async function (req, res) {
    let ans = await manger_competition_module.registerJudgeToCompetition(req.body.insertJudges, req.body.deleteJudges, req.body.compId, req.body.masterJudge);
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getRegistrationState", async function (req, res) {
    let ans = await manger_competition_module.getRegistrationState(req.body.compId);
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/getJudgeRegistrationState", async function (req, res) {
    req.query.competitionOperator = '==';
    let registeredJudges = await manager_judge_module.getJudges(req.query);
    req.query.competitionOperator = '!=';
    let unRegisteredJudges = await manager_judge_module.getJudges(req.query);
    res.status(Math.max(registeredJudges.status, unRegisteredJudges.status)).send({
        registeredJudges: registeredJudges.results,
        unRegisteredJudges: unRegisteredJudges.results
    })
});
//----------------------------------------------------------------------------------------------------------------------

//TODO:: REOMVE CREATED EXCEL FILE FROM HOMEDIR
//----------------------------------------------excel download----------------------------------------------------------

app.get('/downloadExcelFormatSportsman/:token', async (req, res) => {
    res.downloadExcel = util.promisify(res.download);
    let token = req.params.token;
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    id = decoded.id;
    let clubs;
    let coaches;
    if (access == Constants.userType.COACH) {
        clubs = await common_sportclub_module.getSportClubs(id)
        coaches = await common_couches_module.getCoachProfileById(id);
        coaches.results = [coaches.results];
    } else if (access == Constants.userType.MANAGER) {
        clubs = await common_sportclub_module.getSportClubs(undefined);
        coaches = await common_couches_module.getCoaches();
    } else
        res.status(statusCode.badRequest).send(Constants.errorMsg.accessDenied)

    let excelFile = await excelCreation.createExcelRegisterSportsman(clubs.results, coaches.results);

    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })


});
app.get('/downloadExcelFormatCoach/:token', async (req, res) => {
    res.downloadExcel = util.promisify(res.download);
    let token = req.params.token;
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    let clubs;
    if (access === Constants.userType.MANAGER) {
        clubs = await common_sportclub_module.getSportClubs(undefined);
        let excelFile = await excelCreation.createExcelRegisterCoach(clubs.results);
        await res.downloadExcel(excelFile);
        fs.unlink(excelFile, function (err) {
        })

    } else
        res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied);

});
app.get('/downloadExcelFormatJudge/:token', async (req, res) => {
    let token = req.params.token;
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    let clubs;
    if (access === Constants.userType.MANAGER) {
        clubs = await common_sportclub_module.getSportClubs(undefined);
        let excelFile = await excelCreation.createExcelRegisterNewJudge();
        res.downloadExcel = util.promisify(res.download);
        await res.downloadExcel(excelFile);
        fs.unlink(excelFile, function (err) {
        })
    } else
        res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied);

});
app.get('/downloadExcelFormatCoachAsJudge/:token', async (req, res) => {
    let token = req.params.token;
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    let coaches;
    if (access === Constants.userType.MANAGER) {
        coaches = await common_couches_module.getCoachesNotRegisterAsJudges();
        let excelFile = await excelCreation.createExcelCoachAsJudge(coaches.results);
        res.downloadExcel = util.promisify(res.download);
        await res.downloadExcel(excelFile);
        fs.unlink(excelFile, function (err) {
        })
    } else
        res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied);

});
app.get('/downloadExcelFormatRegisterToCompetition/:token/:compId', async (req, res) => {
    let token = req.params.token
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    id = decoded.id;
    let sportsManData;
    if (access == Constants.userType.COACH)
        sportsManData = await coach_sportsman_module.getSportsmen({competition: req.params.compId}, id);
    else if (access == Constants.userType.MANAGER)
        sportsManData = await manger_sportsman_module.getSportsmen({competition: req.params.compId});
    else
        res.status(statusCode.badRequest).send(Constants.errorMsg.accessDenied)
    let categoryData = await common_sportsman_module.getCategories();
    let excelFile = await excelCreation.createExcelRegisterCompetition(sportsManData.results, categoryData.results);
    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })

});
app.get('/downloadExcelCompetitionState/:token/:compId/:date', async (req, res) => {
    let token = req.params.token;
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    id = decoded.id;
    let data;
    if (access == Constants.userType.MANAGER) {
        data = await manger_competition_module.getRegistrationState(req.params.compId);
    } else
        res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied)

    data = data.results;
    let excelFile = await excelCreation.createExcelCompetitionState(data, req.params.date);

    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })


});
app.get('/downloadSportsmanList/:token', async (req, res) => {
    let token = req.params.token;
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    id = decoded.id;
    let data;
    if (access === Constants.userType.MANAGER)
        data = await manger_sportsman_module.getSportsmen(req.query);
    else if (access === Constants.userType.COACH)
        data = await coach_sportsman_module.getSportsmen(req.query, id);
    else
        res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied)

    data = data.results.sportsmen;
    let excelFile = await excelCreation.createSportsmenExcel(data);
    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })
});
app.get('/downloadCoachList/:token', async (req, res) => {
    let token = req.params.token;
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    id = decoded.id;
    let data;
    if (access !== Constants.userType.SPORTSMAN)
        data = await common_couches_module.getCoaches();
    else
        res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied)

    data = data.results;
    let excelFile = await excelCreation.createCoachExcel(data);
    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })
});
app.get('/downloadJudgeList/:token', async (req, res) => {
    let token = req.params.token;
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    id = decoded.id;
    let data;
    if (access !== Constants.userType.SPORTSMAN)
        data = await common_judge_module.getReferees();
    else
        res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied)

    data = data.results;
    let excelFile = await excelCreation.createJudgeExcel(data);
    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })
});
app.get('/downloadExcelFormatUpdateCompetitionResults/:token/:idComp', async function (req, res) {
    let token = req.params.token;
    let idComp = req.params.idComp
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    id = decoded.id;

    if (access !== Constants.userType.MANAGER)
        res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied)

    let sportsman = await manger_competition_module.getRegistrationState(idComp);
    let judges = await master_judge_module.getRegisteredJudgeForCompetition(idComp);

    sportsman = sportsman.results;
    judges = judges.results;

    let excelFile = await excelCreation.createCompetitionUploadGrade(sportsman, judges, idComp);
    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })
})

//----------------------------------------------------------------------------------------------------------------------


//--------------------------------------------Get details---------------------------------------------------------------
app.post("/private/commonCoachManager/getCoaches", async function (req, res) {
    let ans = await common_couches_module.getCoaches();
    res.status(ans.status).send(ans.results);
});
app.post("/private/commonCoachManager/getSportsmen", async function (req, res) {
    let ans;
    if (access === Constants.userType.MANAGER)
        ans = await manger_sportsman_module.getSportsmen(req.query);
    else if (access === Constants.userType.COACH)
        ans = await coach_sportsman_module.getSportsmen(req.query, id);
    res.status(ans.status).send(ans.results);

});
app.get("/private/commonCoachManager/getSportsmen/count", async function (req, res) {
    let ans;
    if (access === Constants.userType.MANAGER)
        ans = await manger_sportsman_module.getSportsmenCount(req.query);
    else if (access === Constants.userType.COACH)
        ans = await coach_sportsman_module.getSportsmenCount(req.query, id);
    res.status(ans.status).send(ans.results);

});
app.post("/private/commonCoachManager/getClubs", async function (req, res) {
    let ans = await common_sportclub_module.getSportClubs();
    res.status(ans.status).send(ans.results)
});
app.get("/private/commonCoachManager/getClubs/:clubId", async function (req, res) {
    let ans = await common_sportclub_module.getDetails(req.params.clubId);
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getErgons", async function (req, res) {
    let ans = await common_sportclub_module.getErgons();
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getAmutas", async function (req, res) {
    let ans = await common_sportclub_module.getAmutas();
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getAgudas", async function (req, res) {
    let ans = await common_sportclub_module.getAgudas();
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getCategories", async function (req, res) {
    let ans = await common_sportsman_module.getCategories();
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getCompetitions", async function (req, res) {
    let ans = await manger_competition_module.getCompetitions(req.query);
    res.status(ans.status).send(ans.results);

});
app.post("/private/allUsers/getCompetitionDetail", async function (req, res) {
    let ans = await common_competition_module.getDetail(req.body.id);
    res.status(ans.status).send(ans.results)
});
app.get("/getCompetitions/count", async function (req, res) {
    let ans = await manger_competition_module.getCompetitionsCount(req.query);
    res.status(ans.status).send(ans.results);
});
app.post("/private/commonCoachManager/getReferees", async function (req, res) {
    let ans = await common_judge_module.getReferees();
    res.status(ans.status).send(ans.results);
});
app.post("/private/getCompetitionToJudge", async function (req, res) {
    let ans = await manager_judge_module.getCompetitionsToJudgeById(id);
    res.status(ans.status).send(ans.results);

});
app.post("/private/judge/getRegisteredJudgeCompetition", async function (req, res) {
    let ans = await master_judge_module.getRegisteredJudgeForCompetition(req.body.compId);
    res.status(ans.status).send(ans.results)
})
app.post("/private/judge/deleteJudgesFromCompetition", async function (req, res) {
    let ans = await master_judge_module.deleteJudgesFromCompetition(req.body.compId, req.body.judgeIds);
    res.status(ans.status).send(ans.results)
})
app.post("/private/commonCoachManager/competitionResults", async function (req, res) {
    let idComp = req.body.idComp
    let ans = await common_competition_module.getCompetitionResultById(idComp);
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/getAdmins", async function (req, res) {
    let ans = await manger_user_module.getAdmins();
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getCoachesNotRegisterAsJudges", async function (req, res) {
    let ans = await common_couches_module.getCoachesNotRegisterAsJudges();
    res.status(ans.status).send(ans.results);

});

//----------------------------------------------------------------------------------------------------------------------


//------------------------------------------------Profile---------------------------------------------------------------
app.post("/private/commonCoachManager/getCoachProfile", async function (req, res) {
    let ans;
    if (req.body.id !== undefined)
        ans = await common_couches_module.getCoachProfileById(req.body.id);
    else
        ans = await common_couches_module.getCoachProfileById(id);
    res.status(ans.status).send(ans.results)
});
app.post("/private/allUsers/sportsmanProfile", async function (req, res) {
    if (req.body.id !== undefined && access === Constants.userType.SPORTSMAN && id !== req.body.id)
        res.status(statusCode.badRequest).send(Constants.errorMsg.accessDenied);
    else {
        let ans;
        if (req.body.id !== undefined)
            ans = await common_sportsman_module.sportsmanProfile(req.body.id);
        else
            ans = await common_sportsman_module.sportsmanProfile(id);
        res.status(ans.status).send(ans.results)
    }
});
app.post("/private/commonCoachManager/getRefereeProfile", async function (req, res) {
    let ans;
    if (req.body.id !== undefined)
        ans = await common_judge_module.getRefereeProfileById(req.body.id);
    else
        ans = await common_judge_module.getRefereeProfileById(id);
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/sportsmanRank", async function (req, res) {
    if (req.body.id !== undefined) {
        let ans = await common_sportsman_module.getSportsmanRank(req.body.id);
        res.status(ans.status).send(ans.results)
    }
})
//----------------------------------------------------------------------------------------------------------------------

//TODO: when implementing delete don't forget to delete also from user_passwords table (you need 2 delete queries -> look at the implementation for the sportsmans)
//------------------------------------------------Delete----------------------------------------------------------------
app.post("/private/commonCoachManager/deleteSportsmanProfile", async function (req, res) {
    if (access === Constants.userType.MANAGER) {
        let ans = await common_user_module.deleteSportsman(req.body.userID);
        res.status(ans.status).send(ans.results)
    } else
        res.status(statusCode.badRequest).send(Constants.errorMsg.accessDenied)
});
//TODO: DELETE COACH FROM ALL TABLE -> BY ORDER . use sql cascade to delete coach. and check that there is no sportsman that connected to the coach.
app.post("/private/manager/deleteCoachProfile", async function (req, res) {

    let ans = await manger_user_module.deleteCoach(req.body.id);
    res.status(ans.status).send(ans.results)

});
app.post("/private/manager/deleteJudgeProfile", async function (req, res) {
    let ans = await manager_judge_module.deleteJudge(req.body.userID);
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/deleteAdmin", async function (req, res) {
    if (req.body.id !== id) {
        let ans = await manger_user_module.deleteAdmin(req.body.id);
        res.status(ans.status).send(ans.results)
    } else
        res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied)
});
//----------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------Add------------------------------------------------------------------
app.post("/private/manager/addNewCategory", async function (req, res) {
    let ans = manger_competition_module.validateDataBeforeAddCategory(req.body);
    if (ans.isPassed)
        ans = await manger_competition_module.addNewCategory(req.body);
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/addClub", async function (req, res) {
    let ans = manger_sportclub_module.validateSportClubDetails(req.body)
    if (ans.isPassed) {
        ans = await manger_sportclub_module.addSportClub(req.body);
        res.status(ans.status).send(ans.results)
    } else
        res.status(Constants.statusCode.badRequest).send(ans.results)
})
app.post("/private/manager/addCompetition", async function (req, res) {
    let ans = manger_competition_module.validateCompetitionDetails(req.body)
    if (ans.isPassed) {
        ans = await manger_competition_module.addCompetition(req.body);
        res.status(ans.status).send(ans.results)
    } else
        res.status(Constants.statusCode.badRequest).send(ans.results)
});
//----------------------------------------------------------------------------------------------------------------------

//------------------------------------------------Update----------------------------------------------------------------
app.post("/private/allUsers/updateSportsmanProfile", async function (req, res) {
    let ans;
    let user = req.body;
    let canEditSportsmanProfile;
    if (access === Constants.userType.COACH) {
        canEditSportsmanProfile = sportsman_user_module.checkIdCoachRelatedSportsman(id, user.id)
    } else if (access === Constants.userType.MANAGER || id === user.id) {
        canEditSportsmanProfile = true;
    }
    if (canEditSportsmanProfile) {
        let ans = userVaildationService.validateUserDetails(user, "sportsman");
        if (ans.canUpdate) {
            ans = await sportsman_user_module.updateSportsmanProfile(common_function.getArrayFromJson(ans.data));
            res.status(ans.status).send(ans.results)
        } else
            res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied)

    } else
        res.status(Constants.statusCode.unauthorized).send(Constants.errorMsg.accessDenied)
});
app.post("/private/manager/closeRegistration", async function (req, res) {
    let ans = await manger_competition_module.closeRegistration(req.body.idCompetition);
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/updateCompetitionDetails", async function (req, res) {
    let idEvent = await manger_competition_module.getIdEvent(req.body.competitionId);
    let ans = await manger_competition_module.updateCompetitionDetails(req.body, idEvent);
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/updateCoachProfile", async function (req, res) {
    let ans;
    let user = req.body
    if (id == user.id || access === Constants.userType.MANAGER) {
        ans = userVaildationService.validateUserDetails(user, "coach")
        if (ans.canUpdate) {
            ans = await coach_user_module.updateCoachProfile(common_function.getArrayFromJson(ans.data));
            res.status(ans.status).send(ans.results)
        } else
            res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied)

    } else
        res.status(Constants.statusCode.unauthorized).send(Constants.errorMsg.accessDenied)

});
app.post("/private/commonCoachManager/updateRefereeProfile", async function (req, res) {
    let ans;
    let user = req.body;
    ans = userVaildationService.validateUserDetails(user, "judge");
    if (ans.canUpdate) {
        ans = await common_judge_module.updateRefereeProfile(common_function.getArrayFromJson(ans.data));
        res.status(ans.status).send(ans.results);
    } else
        res.status(statusCode.badRequest).send(Constants.errorMsg.accessDenied);
});
app.post("/private/manager/updateClubDetails", async function (req, res) {
    let sportsClubDetails = req.body
    let ans = manger_sportclub_module.validateSportClubDetails(sportsClubDetails)
    if (ans.isPassed) {
        ans = await manger_sportclub_module.updateSportClubDetails(sportsClubDetails);
        res.status(ans.status).send(ans.results)
    } else
        res.status(Constants.statusCode.badRequest).send(ans.results)
});

//----------------------------------------------------------------------------------------------------------------------


//------------------------------------------------------files-----------------------------------------------------------
app.post("/private/uploadUserProfileImage/:id/:userType", async function (req, res) {
    //TODO : try to send to picture directly from the client
    // TODO : try to limit the size of the pic +send correct status of the upload
    let form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        let id = req.params.id;
        let picName = id + '_pic.jpeg';
        let userType = req.params.userType;
        let old_path = files.file.path;
        let new_path = __dirname + '/resources/profilePics/' + picName;
        fs.rename(old_path, new_path, function (err) {
        });
        let path = undefined
        await googleDrive.uploadUserPicture(authGoogleDrive, id, new_path, picName, userType).then((res) => {
            fs.unlink(new_path, function (err) {
                if (err) console.log(err)
            })
            path = Constants.googleDrivePath.profilePicPath + res
        }).catch((err) => {
            console.log(err)
        });
        let ans = await common_user_module.updateProfilePic(path, id, userType);
        res.status(ans.status).send(ans.results)
    });

});
app.post("/private/uploadSportsmanFile/:id/:fileType", async function (req, res) {
    let form = new formidable.IncomingForm();
    let fileName = Date.now().toString() + ".pdf";
    let new_path = __dirname + '/resources/' + fileName;
    let path, ans;
    let id = req.params.id;
    await form.parse(req, async function (err, fields, files) {
        let old_path = files.file.path;
        await fs.rename(old_path, new_path, function (err) {
        })
        switch (req.params.fileType) {
            case 'medicalScan' :
                await googleDrive.uploadGoogleDriveFile(authGoogleDrive, id, new_path, fileName, 'sportsman', Constants.googleDriveFolderNames.medical).then(async (res) => {
                    fs.unlinkSync(new_path)
                    path = Constants.googleDrivePath.pdfPreviewPath + res + "/preview";
                }).catch((err) => {
                    console.log(err)
                });
                ans = await coach_sportsman_module.updateMedicalScanDB(path, id);
                break;
            case 'healthInsurance' :
                await googleDrive.uploadGoogleDriveFile(authGoogleDrive, id, new_path, fileName, 'sportsman', Constants.googleDriveFolderNames.insurance).then(async (res) => {
                    fs.unlinkSync(new_path)
                    path = Constants.googleDrivePath.pdfPreviewPath + res + "/preview";
                }).catch((err) => {
                    console.log(err)
                });
                ans = await coach_sportsman_module.updateHealthInsuranceDB(path, id);
                break;
        }
        console.log(ans)
        res.status(200).send("ok")
    });
});
app.get("/downloadSportsmanFile/:token/:fileId/:sportsmanId/:fileType", async function (req, res) {
    let fileId = req.params.fileId;
    let token = req.params.token;
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    if (access == Constants.userType.MANAGER || access == Constants.userType.COACH || decoded.id == req.params.sportsmanId)
        switch (req.params.fileType) {
            case 'medicalScan' :
                await googleDrive.downloadFileFromGoogleDrive(authGoogleDrive, fileId, __dirname, req.params.sportsmanId, 'medicalScan.pdf')
                    .then(async (result) => {
                        res.downloadMedicalScan = util.promisify(res.download);
                        await res.downloadMedicalScan(result.path);
                        fs.unlink(result.path, function (err) {
                        })
                    });
                break;
            case 'healthInsurance':
                await googleDrive.downloadFileFromGoogleDrive(authGoogleDrive, fileId, __dirname, req.params.sportsmanId, 'healthInsurance.pdf')
                    .then(async (result) => {
                        res.downloadHelathInsurance = util.promisify(res.download);
                        await res.downloadHelathInsurance(result.path);
                        fs.unlink(result.path, function (err) {
                        })
                    });
                break;
        }

    else
        res.status(statusCode.badRequest).send(Constants.errorMsg.accessDenied)
});
app.post("/private/uploadJudgeFile/:id/:fileType", async function (req, res) {
    let form = new formidable.IncomingForm();
    let fileName = Date.now().toString() + ".pdf";
    let new_path = __dirname + '/resources/' + fileName;
    let path, ans;
    let id = req.params.id;
    await form.parse(req, async function (err, fields, files) {
        let old_path = files.file.path;
        await fs.rename(old_path, new_path, function (err) {
        })
        switch (req.params.fileType) {
            case 'criminalRecord' :
                await googleDrive.uploadGoogleDriveFile(authGoogleDrive, id, new_path, fileName, 'judge', Constants.googleDriveFolderNames.criminalRecord).then(async (res) => {
                    fs.unlinkSync(new_path)
                    path = Constants.googleDrivePath.pdfPreviewPath + res + "/preview";
                }).catch((err) => {
                    console.log(err)
                });
                ans = await manager_judge_module.updateCriminalRecordDB(path, id);
                break;
        }
        res.status(200).send("ok")
    });
});
app.get("/downloadJudgeFile/:token/:fileId/:judgeId/:fileType", async function (req, res) {
    let fileId = req.params.fileId;
    let token = req.params.token;
    const decoded = jwt.verify(token, secret);
    access = decoded.access;
    if (access == Constants.userType.MANAGER || decoded.id == req.params.judgeId)
        switch (req.params.fileType) {
            case 'criminalRecord' :
                await googleDrive.downloadFileFromGoogleDrive(authGoogleDrive, fileId, __dirname, req.params.judgeId, 'criminalRecord.pdf')
                    .then(async (result) => {
                        res.downloadMedicalScan = util.promisify(res.download);
                        await res.downloadMedicalScan(result.path);
                        fs.unlink(result.path, function (err) {
                        })
                    });
                break;
        }

    else
        res.status(statusCode.badRequest).send(Constants.errorMsg.accessDenied)
});


//----------------------------------------------------------------------------------------------------------------------

//---------------------------------------------judging competition------------------------------------------------------
app.post("/private/judge/updateSportsmanCompetitionGrade", async function (req, res) {
    let details = req.body
    let ans = await master_judge_module.insertJudgeGradeForSportsman(details);
    res.status(ans.status).send(ans.results)

});
app.post("/private/judge/manualCloseCompetition", async function (req, res) {
    let idComp = req.body.idComp
    let ans = await master_judge_module.manualCloseCompetition(idComp);
    res.status(ans.status).send(ans.results)

});
app.post("/private/judge/excelUpdateTaulloCompetitionGrade", async function (req, res) {
    let sportsmanGrade = req.body.sportsman;
    let idComp = req.body.idComp
    if (sportsmanGrade.length == 0)
        res.status(statusCode.badRequest).send({line: 0, errors: [Constants.errorMsg.emptyExcel]});
    else {
        let judges = await master_judge_module.getRegisteredJudgeForCompetition(idComp)
        judges = judges.results
        let numOfJudges = judges.length
        let checkData = competitionValidationService.checkExcelCompetitionsGrade(sportsmanGrade, Constants.sportStyle.taullo, numOfJudges);
        if (checkData.isPassed) {
            let registerStatus = await master_judge_module.uploadTaulloCompetitionGrade(checkData.users, idComp, judges, numOfJudges);
            res.status(registerStatus.status).send(registerStatus.results);
        } else
            res.status(statusCode.badRequest).send(checkData.results);
    }
})
app.post("/private/manager/updateCompetitionGrades", async function (req, res) {
    let sportsman = req.body.grades
    let idComp = req.body.idComp
    let ans = await manger_competition_module.updateCompetitionGrades(sportsman, idComp)
    res.status(ans.status).send(ans.results)

})

//----------------------------------------------------------------------------------------------------------------------

//-------------------------------------------charts---------------------------------------------------------------------
app.post("/private/allUsers/participateSportsmanCompetitions", async function (req, res) {
    let ans = await sportsman_charts.getParticipateSportsManCompetitions(req.body.sportsmanId)
    res.status(ans.status).send(ans);
})
app.post("/private/allUsers/sportsmanRecords", async function (req, res) {
    let ans = await sportsman_charts.getSportsmanRecords(req.body.sportsmanId)
    res.status(ans.status).send(ans)

})
app.post("/private/commonCoachManager/clubTree", async function (req, res) {
    let ans = await club_charts.getClubTree(req.body.clubId)
    res.status(ans.status).send(ans.result)

})
app.post("/private/commonCoachManager/clubsParticipateSportsmanCompetitions", async function (req, res) {
    let ans = await club_charts.getClubParticipateSportsmanCompetitions(req.body.clubId)
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/wushuTree", async function (req, res) {
    let ans = await organization_charts.getWushuTree()
    res.status(ans.status).send(ans.results)

})
app.post("/private/allUsers/sportsmanJudgeGrades", async function (req, res) {
    let ans = await sportsman_charts.getSportsmanJudgeRecords(req.body.sportsmanId)
    res.status(ans.status).send(ans)
})


//------------------------------------------msg board-------------------------------------------------------------------
app.post("/private/manager/getAllMessages", async function (req, res) {
    let ans = await msg_board.getAllMsg()
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/getMessageById", async function (req, res) {
    let ans = await msg_board.getMsgById(req.body.msgId)
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/deleteMessage", async function (req, res) {
    let ans = await msg_board.deleteMessage(req.body.msgId)
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/addMessage", async function (req, res) {
    let ans = await msg_board.addMessage(req.body.msg)
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/editMessage", async function (req, res) {
    let ans = await msg_board.editMessage(req.body.msg,req.body.msgId)
    res.status(ans.status).send(ans.results)

})
//start the server
server.listen(process.env.PORT || 3000, () => {
    console.log("Server has been started !!");
    console.log("port 3000");
    console.log("wu-shu project");
    console.log("----------------------------------");

});
