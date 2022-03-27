mySqlDb = require('./dbUtils');
global.__basedir = __dirname;

let express = require('express');
let app = express();
let server = require('http').createServer(app);
let bodyParser = require("body-parser");
let cors = require('cors');
let formidable = require('formidable');
let fs = require("fs");
let schedule = require('node-schedule');
const util = require('util');
const constants = require('./constants');
io = require('socket.io').listen(server);
jwt = require("jsonwebtoken");


let id, access;

//---------------------------------------------Google-Drive-------------------------------------------------------------
const googleDrive = require("./implementation/services/googleDrive/googleDriveService");
let googleDriveCredentials = (fs.readFileSync('./implementation/services/googleDrive/credentials.json'));
googleDriveCredentials = JSON.parse(googleDriveCredentials);
let authGoogleDrive = googleDrive.authorize(googleDriveCredentials);


//----------------------------------------------------------------------------------------------------------------------
//import all modules
const userPasswordModule = require('./implementation/modules/userPasswordModule')
const categoryModule = require('./implementation/modules/categoryModule')
const userJudgeModule = require('./implementation/modules/userJudgeModule')
const competitionSportsmanModule = require('./implementation/modules/competitionSportsmanModule')
const competitionJudgeModule = require('./implementation/modules/competitionJudgeModule')
const sportClubModule = require('./implementation/modules/sportClubModule')
const userCoachModule = require('./implementation/modules/userCoachModule')
const addressModule=require('./implementation/modules/addressModule')
const sportsmanCoachModule = require('./implementation/modules/sportsmanCoachModule')
const sportcenterModule = require('./implementation/modules/sportcenterModule')
const amutaModule = require('./implementation/modules/amutaModule')
const agudaModule = require('./implementation/modules/agudaModule')
const msgBoardModule = require('./implementation/modules/msgBoardModule')
const eventsModule = require('./implementation/modules/eventsModule')
const sportsmanFilesModule = require('./implementation/modules/sportsmanFilesModule')
const judgeFilesModule = require('./implementation/modules/judgeFilesModule')
const competitionModule = require('./implementation/modules/competitionModule')
const competitionResultsModule = require('./implementation/modules/competitionResultsModule')
const userAdminModule = require('./implementation/modules/userAdminModule')
const userTypesModule = require('./implementation/modules/userTypesMoudle')
const userSportsmanModule = require('./implementation/modules/userSportsmanModule')

//import all services
const registerService = require('./implementation/services/register/register')
const loginService = require('./implementation/services/loginService')
const categoryService = require('./implementation/services/categoryService')
const competitionRegistrationService = require('./implementation/services/competitionRegistrationService')
const excelRegisterService = require('./implementation/services/register/excelRegister')
const sportsmanService = require('./implementation/services/sportsmanService')
const competitionService = require('./implementation/services/competitionService')
const userService = require('./implementation/services/userService')
const sportClubService = require('./implementation/services/sportclubService')
const sportAmutaService = require('./implementation/services/sportamutaService')
const coachService = require('./implementation/services/coachService')
const judgeService = require('./implementation/services/judgeService')
const judgementService = require('./implementation/services/judgementService')
const emailService = require('./implementation/services/emailService')

//import all charts
const sportsman_charts = require("./implementation/charts/sportsman")
const club_charts = require("./implementation/charts/clubs")
const organization_charts = require("./implementation/charts/organization")

//dont delete this
const socketService = require("./SocketService");
const common_function = require("./implementation/commonFunc");
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
    initialServerError: 500,
};


//---------------------------------------server schedule Jobs-----------------------------------------------------------
let automaticCloseCompetition = schedule.scheduleJob({minute: 600}, function () {
    competitionModule.autoCloseRegCompetition();
});
let automaticOpenCompetitionToJudge = schedule.scheduleJob({minute: 30}, function () {
    competitionModule.autoOpenCompetitionToJudge()

})
let autoReminderForUploadCriminalRecord = schedule.scheduleJob({dayOfWeek: 0, hour: 12}, function () {
    emailService.autoReminderForUploadCriminalRecord()
        .then(() => console.log("[Log] -autoReminderForUploadCriminalRecord succeed")).catch((error => console.log(error)))

})


//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------app uses----------------------------------------------------------------------
app.use(cors());
app.options('*', cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});
app.use(bodyParser.urlencoded({extend: true}));
app.use(bodyParser.json());
app.use("/private", (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) res.status(statusCode.unauthorized).send("Access denied. No token provided.");
    try {
        const decoded = jwt.verify(token, constants.secret);
        req.decoded = decoded;

        access = jwt.decode(req.header("x-auth-token")).access;
        id = jwt.decode(req.header("x-auth-token")).id;

        next();
    } catch (exception) {
        res.status(statusCode.badRequest).send("Invalid token. Permission denied");
    }
});
app.use("/private/manager", (req, res, next) => {
    if (access === constants.userType.MANAGER)
        next();
    else
        res.status(constants.statusCode.unauthorized).send(constants.errorMsg.accessDenied);
});
app.use("/private/sportsman", (req, res, next) => {
    if (access === constants.userType.SPORTSMAN)
        next();
    else
        res.status(constants.statusCode.unauthorized).send(constants.errorMsg.accessDenied);


});
app.use("/private/coach", (req, res, next) => {
    if (access === constants.userType.COACH)
        next();
    else
        res.status(constants.statusCode.unauthorized).send(constants.errorMsg.accessDenied);


});
app.use("/private/judge", (req, res, next) => {
    if (access === constants.userType.JUDGE || access === constants.userType.MANAGER)
        next();
    else
        res.status(constants.statusCode.unauthorized).send(constants.errorMsg.accessDenied);


});
app.use("/private/allUsers", (req, res, next) => {
    if (access === constants.userType.SPORTSMAN || access === constants.userType.MANAGER || access === constants.userType.COACH || access == constants.userType.JUDGE)
        next();
    else
        res.status(constants.statusCode.unauthorized).send(constants.errorMsg.accessDenied);
});
app.use("/private/commonCoachManager", (req, res, next) => {
    if (access === constants.userType.MANAGER || access === constants.userType.COACH || access == constants.userType.JUDGE)
        next();
    else
        res.status(constants.statusCode.unauthorized).send(constants.errorMsg.accessDenied);
});


//----------------------------------------------------------------------------------------------------------------------
//-----------------------------------------app options------------------------------------------------------------------



//----------------------------------------------------------------------------------------------------------------------

//--------------------------------------------Login---------------------------------------------------------------------
app.post("/loginFirstStep", async (req, res) => {
    let ans = await userPasswordModule.checkUserDetailsForLogin(req.body);
    if (!ans.isPassed || ans.dbResults.usertype == constants.userType.SPORTSMAN)
        res.status(statusCode.unauthorized).send(ans.err);
    else
        res.status(statusCode.ok).send(ans)
});
app.post("/loginSecondStep", async (req, res) => {
    if (!req.body)
        res.status(statusCode.unauthorized).send(constants.errorMsg.accessDenied);
    else {
        let ans = req.body;
        let userDetails = await loginService.getUserDetails(ans);
        let token = loginService.buildToken(userDetails, ans);
        res.status(statusCode.ok).send(token)
    }
});
app.post("/private/changePassword", async function (req, res) {
    let userData = {
        id: id,
        newPass: req.body.password
    }
    let ans = await userPasswordModule.validateDiffPass(userData);
    if (ans.isPassed) {
        ans = await userPasswordModule.changeUserPassword(userData);
        res.status(ans.status).send(ans.results)
    } else
        res.status(ans.status).send(ans.err)
});

//----------------------------------------------------------------------------------------------------------------------


//--------------------------------------------Register------------------------------------------------------------------
app.post("/private/commonCoachManager/registerSportsmenExcel", async function (req, res) {
    let usersToRegister = req.body;
    if (usersToRegister.length == 0)
        res.status(statusCode.badRequest).send({line: 0, errors: [constants.errorMsg.emptyExcel]});
    else {
        let checkData = userVaildationService.checkExcelDataBeforeRegister(usersToRegister, "sportsman");
        let line=1;
        let index=0;
        var bool=false;
        let ids=[]
        for(var user_check_id in usersToRegister){
            let checkUser= await userService.checkUserExist(usersToRegister[user_check_id][constants.colRegisterSportsmanExcel.idSportsman])
            ids.forEach(element => {
                if(element.localeCompare(usersToRegister[user_check_id][constants.colRegisterSportsmanExcel.idSportsman])==0){
                    checkUser.status=200;
                }
            });
            if(checkUser.status==200){
                if(checkData.results.length===0)
                    checkData.results=[]
                
                for (let i = 0; i < checkData.results.length; i++) {
                    element=checkData.results[i];
                    if (line==element.line){
                        bool=true;
                        index=i;
                    }
                }

                if(!bool){
                    checkData.results.push(new Object());
                    index=checkData.results.length-1
                    checkData.results[index].errors=[]
                }
                checkData.results[index].line=line;
                checkData.results[index].errors.push("ת.ז ספורטאי כבר רשומה במערכת")
                checkData.isPassed=false;
                bool=false;
            }
            line++;
            ids.push(usersToRegister[user_check_id][constants.colRegisterSportsmanExcel.idSportsman]);
        }
        if (checkData.isPassed) {
            let registerStatus = await registerService.registerSportsman(checkData.users);
            res.status(registerStatus.status).send(registerStatus.results);
        } else
            res.status(statusCode.badRequest).send(checkData.results);
            
    }
});
app.post("/private/commonCoachManager/registerSportsmanManual", async function (req, res) {
    let user = req.body[0];
    let ans = await userVaildationService.checkDataBeforeRegister(user, "sportsman");
    if (ans.isPassed) {
        //ans.users = common_function.getArrayFromJson(ans.users);
        ans.users = common_function.getArrayUserFromJson(ans.users);
        ans = await registerService.registerSportsman([ans.users]);
        res.status(ans.status).send(ans.results);
    } else
        res.status(statusCode.badRequest).send(ans.results);

});
app.post("/private/manager/registerCoachManual", async function (req, res) {
    let user = req.body[0];
    let ans = userVaildationService.checkDataBeforeRegister(user, "coach");
    if (ans.isPassed) {
        ans.users = common_function.getArrayFromJson(ans.users);
        ans = await registerService.registerCoaches([ans.users]);
        res.status(ans.status).send(ans.results);

    } else
        res.status(statusCode.badRequest).send(ans.results);


})
app.post("/private/manager/registerCoachExcel", async function (req, res) {
    let usersToRegister = req.body;
    if (usersToRegister.length == 0)
        res.status(statusCode.badRequest).send({line: 0, errors: [constants.errorMsg.emptyExcel]});
    else {
        let checkData = userVaildationService.checkExcelDataBeforeRegister(usersToRegister, "coach");
        if (checkData.isPassed) {
            let registerStatus = await registerService.registerCoaches(checkData.users);
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
        ans = await registerService.registerNewJudge([ans.users]);
        res.status(ans.status).send(ans.results)
    } else
        res.status(constants.statusCode.badRequest).send(ans.results)
});
app.post("/private/commonCoachManager/regExcelCompetitionSportsmen", async function (req, res) {
    let ans;
    let sportsmenArr = common_function.getArrayFromJsonArray(req.body.sportsman)
    sportsmenArr.shift();
    let categoryData = await categoryModule.getCategories();
    let sportsmen = categoryService.fixCategoryExcelData(sportsmenArr);
    ans = categoryService.checkCategoryExcelData(sportsmenArr, categoryData.results);
    if (sportsmenArr.length == 0)
        res.status(constants.statusCode.badRequest).send([{error: constants.errorMsg.emptyExcel}])
    else {
        if (ans.pass) {
            let delSportsman = competitionRegistrationService.getIdsForDelete(sportsmen)
            ans = await competitionRegistrationService.deleteSportsmanFromCompetition(delSportsman, req.body.compId);
            if (ans.pass) {
                ans = await competitionRegistrationService.regExcelSportsmenCompDB(sportsmen, req.body.compId);
                await competitionRegistrationService.reRangeCompetitionSportsman(req.body.compId)
            }

            res.status(ans.status).send(ans.results)
        } else
            res.status(constants.statusCode.badRequest).send(ans.results)
    }
});

app.post("/private/manager/registerCoachAsJudge", async function (req, res) {
    let ans;
    let coachAsJudgeData = excelRegisterService.cleanCoachAsJudgeExcelData(common_function.getArrayFromJsonArray(req.body))
    ans = await userJudgeModule.registerCoachAsJudge(coachAsJudgeData);
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/regExcelJudge", async function (req, res) {
    let usersToRegister = req.body;
    if (usersToRegister.length == 0)
        res.status(statusCode.badRequest).send({line: 0, errors: [constants.errorMsg.emptyExcel]});
    else {
        let checkData = userVaildationService.checkExcelDataBeforeRegister(usersToRegister, "judge");
        if (checkData.isPassed) {
            let registerStatus = await registerService.registerNewJudge(checkData.users);
            res.status(registerStatus.status).send(registerStatus.results);
        } else
            res.status(statusCode.badRequest).send(checkData.results);
    }
});
app.post("/private/manager/registerAdmin", async function (req, res) {
    let ans = await registerService.registerAdmin(req.body);
    res.status(ans.status).send(ans.results)
})


//----------------------------------------------------------------------------------------------------------------------

//---------------------------------------------Competition registration-------------------------------------------------
app.post("/private/commonCoachManager/competitionSportsmen", async function (req, res) {
    let ans = await competitionRegistrationService.registerSportsmenToCompetition(req.body.insertSportsman, req.body.deleteSportsman, req.body.updateSportsman, req.body.compId);
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/competitionJudge", async function (req, res) {
    let ans = await competitionRegistrationService.registerJudgeToCompetition(req.body.insertJudges, req.body.deleteJudges, req.body.compId, req.body.masterJudge);
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getRegistrationState", async function (req, res) {
    let ans = await competitionSportsmanModule.getSportsmenRegistrationState(req.body.compId);
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/getJudgeRegistrationState", async function (req, res) {
    req.query.competitionOperator = '==';
    let registeredJudges = await competitionJudgeModule.getJudges(req.query);
    req.query.competitionOperator = '!=';
    let unRegisteredJudges = await competitionJudgeModule.getJudges(req.query);
    res.status(Math.max(registeredJudges.status, unRegisteredJudges.status)).send({
        registeredJudges: registeredJudges.results,
        unRegisteredJudges: unRegisteredJudges.results
    })
});
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------excel download----------------------------------------------------------
function decodeToken(token) {
    const decoded = jwt.verify(token, constants.secret);
    access = decoded.access;
    id = decoded.id
}

app.get('/downloadExcelFormatSportsman/:token', async (req, res) => {
    res.downloadExcel = util.promisify(res.download);
    decodeToken(req.params.token)
    let clubs, coaches;
    if (access == constants.userType.COACH) {
        clubs = await sportClubModule.getSportClubs(id)
        coaches = await userCoachModule.getClubCoaches(clubs.results[0].id);
        coaches.results = [coaches.results];
        coaches.results = coaches.results[0]
    } else if (access == constants.userType.MANAGER) {
        clubs = await sportClubModule.getSportClubs(undefined);
        coaches = await userCoachModule.getCoaches();
    } else
        res.status(statusCode.badRequest).send(constants.errorMsg.accessDenied)

    let excelFile = await excelCreation.createExcelRegisterSportsman(clubs.results, coaches.results);

    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })


});
app.get('/downloadExcelFormatCoach/:token', async (req, res) => {
    res.downloadExcel = util.promisify(res.download);
    decodeToken(req.params.token)
    let clubs;
    if (access === constants.userType.MANAGER) {
        clubs = await sportClubModule.getSportClubs(undefined);
        let excelFile = await excelCreation.createExcelRegisterCoach(clubs.results);
        await res.downloadExcel(excelFile);
        fs.unlink(excelFile, function (err) {
        })

    } else
        res.status(constants.statusCode.badRequest).send(constants.errorMsg.accessDenied);

});
app.get('/downloadExcelFormatJudge/:token', async (req, res) => {
    decodeToken(req.params.token);
    let clubs;
    if (access === constants.userType.MANAGER) {
        clubs = await sportClubModule.getSportClubs(undefined);
        let excelFile = await excelCreation.createExcelRegisterNewJudge(clubs.results);
        res.downloadExcel = util.promisify(res.download);
        await res.downloadExcel(excelFile);
        fs.unlink(excelFile, function (err) {
        })
    } else
        res.status(constants.statusCode.badRequest).send(constants.errorMsg.accessDenied);

});
app.get('/downloadExcelFormatCoachAsJudge/:token', async (req, res) => {
    decodeToken(req.params.token);
    let coaches;
    if (access === constants.userType.MANAGER) {
        coaches = await userCoachModule.getCoachesNotRegisterAsJudges();
        let excelFile = await excelCreation.createExcelCoachAsJudge(coaches.results);
        res.downloadExcel = util.promisify(res.download);
        await res.downloadExcel(excelFile);
        fs.unlink(excelFile, function (err) {
        })
    } else
        res.status(constants.statusCode.badRequest).send(constants.errorMsg.accessDenied);

});
app.get('/downloadExcelFormatRegisterToCompetition/:token/:compId', async (req, res) => {
    decodeToken(req.params.token)
    let sportsManData;
    if (access == constants.userType.COACH)
        sportsManData = await sportsmanService.getSportsmen_Coach({competition: req.params.compId}, id);
    else if (access == constants.userType.MANAGER)
        sportsManData = await sportsmanService.getSportsmen_Manager({competition: req.params.compId});
    else
        res.status(statusCode.badRequest).send(constants.errorMsg.accessDenied)
    let categoryData = await categoryModule.getCategories();
    let excelFile = await excelCreation.createExcelRegisterCompetition(sportsManData.results, categoryData.results);
    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })

});
app.get('/downloadExcelCompetitionState/:token/:compId/:date', async (req, res) => {
    decodeToken(req.params.token);
    let data;
    if (access == constants.userType.MANAGER) {
        data = await competitionSportsmanModule.getSportsmenRegistrationState(req.params.compId);
    } else
        res.status(constants.statusCode.badRequest).send(constants.errorMsg.accessDenied)

    data = data.results;
    let excelFile = await excelCreation.createExcelCompetitionState(data, req.params.date);

    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })


});
app.get('/downloadSportsmanList/:token', async (req, res) => {
    decodeToken(req.params.token);
    let data;
    if (access === constants.userType.MANAGER)
        data = await sportsmanService.getSportsmen_Manager(req.query);
    else if (access === constants.userType.COACH)
        data = await sportsmanService.getSportsmen_Coach(req.query, id);
    else
        res.status(constants.statusCode.badRequest).send(constants.errorMsg.accessDenied)

    data = data.results.sportsmen;
    let excelFile = await excelCreation.createSportsmenExcel(data);
    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })
});
app.get('/downloadCoachList/:token', async (req, res) => {
    decodeToken(req.params.token);
    let data;
    if (access !== constants.userType.SPORTSMAN)
        data = await userCoachModule.getCoaches();
    else
        res.status(constants.statusCode.badRequest).send(constants.errorMsg.accessDenied)

    data = data.results;
    let excelFile = await excelCreation.createCoachExcel(data);
    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })
});
app.get('/downloadJudgeList/:token', async (req, res) => {
    decodeToken(req.params.token);
    let data;
    if (access !== constants.userType.SPORTSMAN)
        data = await userJudgeModule.getJudges();
    else
        res.status(constants.statusCode.badRequest).send(constants.errorMsg.accessDenied)

    data = data.results;
    let excelFile = await excelCreation.createJudgeExcel(data);
    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })
});
app.get('/downloadExcelFormatUpdateCompetitionResults/:token/:idComp', async function (req, res) {
    decodeToken(req.params.token);
    let idComp = req.params.idComp

    if (access !== constants.userType.MANAGER)
        res.status(constants.statusCode.badRequest).send(constants.errorMsg.accessDenied)

    let sportsman = await competitionSportsmanModule.getSportsmenRegistrationState(idComp);
    let judges = await competitionJudgeModule.getRegisteredJudgeForCompetition(idComp);

    sportsman = sportsman.results;
    judges = judges.results;

    let excelFile = await excelCreation.createCompetitionUploadGrade(sportsman, judges, idComp);
    res.downloadExcel = util.promisify(res.download);
    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })
})
app.get('/downloadExcelEditSportsmanDetails/:token', async (req, res) => {
    res.downloadExcel = util.promisify(res.download);
    decodeToken(req.params.token);
    let clubs;
    let coaches;
    let sportsmen;

    if (access == constants.userType.COACH) {
        clubs = await sportClubModule.getSportClubs(id)
        coaches = await userCoachModule.getClubCoaches(clubs.results[0].id);
        coaches.results = [coaches.results];
        coaches.results = coaches.results[0]
        sportsmen = await sportsmanService.getAllSportsmenDetails(id);
    } else if (access == constants.userType.MANAGER) {
        clubs = await sportClubModule.getSportClubs(undefined);
        coaches = await userCoachModule.getCoaches();
        sportsmen = await sportsmanService.getAllSportsmenDetails();
    } else
        res.status(statusCode.badRequest).send(constants.errorMsg.accessDenied)

    let excelFile = await excelCreation.editSportsmanDetails(sportsmen.results, coaches.results, clubs.results);

    await res.downloadExcel(excelFile);
    fs.unlink(excelFile, function (err) {
    })

});
//----------------------------------------------------------------------------------------------------------------------


//--------------------------------------------Get details---------------------------------------------------------------
app.post("/private/commonCoachManager/getCoaches", async function (req, res) {
    let ans = await userCoachModule.getCoaches();
    res.status(ans.status).send(ans.results);
});
app.post("/private/commonCoachManager/getSportsmen", async function (req, res) {
    let ans;
    if (access === constants.userType.MANAGER)
        ans = await sportsmanService.getSportsmen_Manager(req.query);
    else if (access === constants.userType.COACH)
        ans = await sportsmanService.getSportsmen_Coach(req.query, id);
    res.status(ans.status).send(ans.results);

});
app.post("/private/manager/getCoachSportsmen", async function (req, res) {
    let ans;
    ans = await sportsmanCoachModule.getCoachSportsmen(req.body.coachId);
    res.status(ans.status).send(ans.results);

});
app.get("/private/commonCoachManager/getSportsmen/count", async function (req, res) {
    let ans;
    if (access === constants.userType.MANAGER)
        ans = await sportsmanService.getSportsmenCount_Manager(req.query);
    else if (access === constants.userType.COACH)
        ans = await sportsmanService.getSportsmenCount_Coach(req.query, id);
    res.status(ans.status).send(ans.results);

});
app.post("/private/commonCoachManager/getClubs", async function (req, res) {
    let ans = await sportClubModule.getSportClubs();
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getAddresses", async function (req, res) {
    let ans = await addressModule.getAddresses();
    res.status(ans.status).send(ans.results)
});
app.get("/private/commonCoachManager/getClubs/:clubId", async function (req, res) {
    let ans = await sportClubModule.getClubDetails(req.params.clubId);
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getErgons", async function (req, res) {
    let ans = await sportcenterModule.getErgons();
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getAmutas", async function (req, res) {
    let ans = await amutaModule.getAmutas();
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getAgudas", async function (req, res) {
    let ans = await agudaModule.getAgudas();
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getCategories", async function (req, res) {
    let ans = await categoryModule.getCategories();
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getCompetitions", async function (req, res) {
    let ans = await competitionService.getCompetitions(req.query);
    res.status(ans.status).send(ans.results);

});
app.post("/private/allUsers/getCompetitionDetail", async function (req, res) {
    let ans = await competitionModule.getCompetitionDetails(req.body.id);
    res.status(ans.status).send(ans.results)
});
app.get("/getCompetitions/count", async function (req, res) {
    let ans = await competitionService.getCompetitionsCount(req.query);
    res.status(ans.status).send(ans.results);
});
app.post("/private/commonCoachManager/getReferees", async function (req, res) {
    let ans = await userJudgeModule.getJudges();
    res.status(ans.status).send(ans.results);
});
app.post("/private/getCompetitionToJudge", async function (req, res) {
    let ans = await competitionModule.getCompetitionsToJudgeById(id);
    res.status(ans.status).send(ans.results);

});
app.post("/private/judge/getRegisteredJudgeCompetition", async function (req, res) {
    let ans = await competitionJudgeModule.getRegisteredJudgeForCompetition(req.body.compId);
    res.status(ans.status).send(ans.results)
})
app.post("/private/judge/deleteJudgesFromCompetition", async function (req, res) {
    let ans = await competitionRegistrationService.deleteJudgesFromCompetition(req.body.compId, req.body.judgeIds);
    res.status(ans.status).send(ans.results)
})
app.post("/private/commonCoachManager/competitionResults", async function (req, res) {
    let idComp = req.body.idComp
    let ans = await competitionResultsModule.getCompetitionResultById(idComp);
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/getAdmins", async function (req, res) {
    let ans = await userAdminModule.getAdmins();
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/getCoachesNotRegisterAsJudges", async function (req, res) {
    let ans = await userCoachModule.getCoachesNotRegisterAsJudges();
    res.status(ans.status).send(ans.results);

});
app.post("/private/commonCoachManager/getClubCoaches", async function (req, res) {
    let clubId = req.body.clubId
    let ans = await userCoachModule.getClubCoaches(clubId);
    ans.results = [ans.results];
    ans.results = ans.results[0]
    res.status(ans.status).send(ans.results);

});
app.post("/private/allUsers/checkExistUser", async function (req, res) {
    let userId = req.body.userId
    let ans = await userService.checkUserExist(userId)
    res.status(ans.status).send(ans.results);
});
app.post("/private/commonCoachManager/checkExistAmuta", async function (req, res) {
    let ans = await sportAmutaService.checkAmutaExist(req.body.Id)
    res.status(ans.status).send(ans.results);
});

//----------------------------------------------------------------------------------------------------------------------


//------------------------------------------------Profile---------------------------------------------------------------
app.post("/private/commonCoachManager/getCoachProfile", async function (req, res) {
    let ans;
    if (req.body.id !== undefined)
        ans = await userCoachModule.getCoachProfileById(req.body.id);
    else
        ans = await userCoachModule.getCoachProfileById(id);
    res.status(ans.status).send(ans.results)
});
app.post("/private/allUsers/sportsmanProfile", async function (req, res) {
    if (req.body.id !== undefined && access === constants.userType.SPORTSMAN && id !== req.body.id)
        res.status(statusCode.badRequest).send(constants.errorMsg.accessDenied);
    else {
        let ans;
        if (req.body.id !== undefined)
            ans = await userSportsmanModule.sportsmanProfile(req.body.id);
        else
            ans = await userSportsmanModule.sportsmanProfile(id);
        res.status(ans.status).send(ans.results)
    }
});
app.post("/private/commonCoachManager/getRefereeProfile", async function (req, res) {
    let ans;
    if (req.body.id !== undefined)
        ans = await userJudgeModule.getJudgeProfileById(req.body.id);
    else
        ans = await userJudgeModule.getJudgeProfileById(id);
    res.status(ans.status).send(ans.results)
});
app.post("/private/commonCoachManager/sportsmanRank", async function (req, res) {
    if (req.body.id !== undefined) {
        let ans = await competitionResultsModule.getSportsmanRank(req.body.id);
        res.status(ans.status).send(ans.results)
    }
})
//----------------------------------------------------------------------------------------------------------------------

//TODO: when implementing delete don't forget to delete also from user_passwords and user_userTypes table (you need 2 delete queries -> look at the implementation for the sportsmans)
//------------------------------------------------Delete----------------------------------------------------------------
app.post("/private/commonCoachManager/deleteSportsmanProfile", async function (req, res) {
    if (access === constants.userType.MANAGER || access === constants.userType.COACH) {
        let ans = await userSportsmanModule.deleteSportsman(req.body.userID)
        await userPasswordModule.deletePassword(req.body.userID)
        res.status(ans.status).send(ans.results)
    } else
        res.status(statusCode.badRequest).send(constants.errorMsg.accessDenied)
});
app.post("/private/manager/deleteCoachProfile", async function (req, res) {
    let ans = await userCoachModule.deleteCoach(req.body.id);
    await userPasswordModule.deletePassword(req.body.id)
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/deleteJudgeProfile", async function (req, res) {
    let ans = await userJudgeModule.deleteJudge(req.body.userID);
    await userPasswordModule.deletePassword(req.body.userID)
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/deleteAdmin", async function (req, res) {
    if (req.body.id !== id) {
        let ans = await userAdminModule.deleteAdmin(req.body.id);
        await userPasswordModule.deletePassword(req.body.id)
        res.status(ans.status).send(ans.results)
    } else
        res.status(constants.statusCode.badRequest).send(constants.errorMsg.accessDenied)
});
//----------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------Add------------------------------------------------------------------
app.post("/private/manager/addNewCategory", async function (req, res) {
    let ans = categoryService.validateDataBeforeAddCategory(req.body);
    if (ans.isPassed)
        ans = await categoryModule.addNewCategory(req.body);
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/addClub", async function (req, res) {
    let ans = sportClubService.validateSportClubDetails(req.body)
    if (ans.isPassed) {
        ans = await sportClubModule.addSportClub(req.body);
        res.status(ans.status).send(ans.results)
    } else
        res.status(constants.statusCode.badRequest).send(ans.results)
})
app.post("/private/manager/addAmuta", async function (req, res) {
    let ans = sportAmutaService.validateSportAmutaDetails(req.body)
    if (ans.isPassed) {
        ans = await amutaModule.addSportAmuta(req.body);
        res.status(ans.status).send(ans.results)
    } else
        res.status(constants.statusCode.badRequest).send(ans.results)
})
app.post("/private/manager/addCompetition", async function (req, res) {
    let ans = competitionService.validateCompetitionDetails(req.body)
    if (ans.isPassed) {
        ans = await competitionModule.addCompetition(req.body);
        res.status(ans.status).send(ans.results)
    } else
        res.status(constants.statusCode.badRequest).send(ans.results)
});
//----------------------------------------------------------------------------------------------------------------------

//------------------------------------------------Update----------------------------------------------------------------

app.post("/private/manager/closeRegistration", async function (req, res) {
    let ans = await competitionModule.closeRegistration(req.body.idCompetition);
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/updateCompetitionDetails", async function (req, res) {
    let idEvent = await competitionModule.getIdEvent(req.body.competitionId);
    let ans = await competitionModule.updateCompetitionDetails(req.body, idEvent);
    res.status(ans.status).send(ans.results)
});
app.post("/private/manager/updateClubDetails", async function (req, res) {
    let sportsClubDetails = req.body
    let ans = sportClubService.validateSportClubDetails(sportsClubDetails)
    if (ans.isPassed) {
        ans = await sportClubModule.updateSportClubDetails(sportsClubDetails);
        res.status(ans.status).send(ans.results)
    } else
        res.status(constants.statusCode.badRequest).send(ans.results)
});
app.post("/private/commonCoachManager/changeSportsmanCoach", async function (req, res) {
    let coachId = req.body.coachId
    let sportsmanId = req.body.sportsmanId
    let ans = await sportsmanCoachModule.updateSportsmanCoach(coachId, sportsmanId)
    res.status(ans.status).send(ans.results)


});
app.post("/private/allUser/updateProfile", async function (req, res) {
    let data = req.body
    let userTypes = await userTypesModule.getUserTypes(data.id)
    let sportsmanUpdate, coachUpdate, judgeUpdate;
    let canUpdate = true
    let error = null
    if (userTypes.status == constants.statusCode.ok) {
        if (userTypes.results.find(type => type.usertype == constants.userType.SPORTSMAN)) {
            let sportsmanProfile = await userSportsmanModule.sportsmanProfile(data.id);
            sportsmanUpdate = await sportsmanService.updateProfile(data, access, id, sportsmanProfile.results)
            if (sportsmanUpdate[0].status != constants.statusCode.ok)
                canUpdate = false;
                error = sportsmanUpdate[0].errors
        }
        if (userTypes.results.find(type => type.usertype == constants.userType.COACH)) {
            let coachProfile = await userCoachModule.getCoachProfileById(data.id);
            coachUpdate = await coachService.updateProfile(data, access, id, coachProfile.results)
            if (coachUpdate[0].status != constants.statusCode.ok)
                canUpdate = false;
                error = coachUpdate[0].errors
        }
        if (userTypes.results.find(type => type.usertype == constants.userType.JUDGE)) {
            let judgeProfile = await userJudgeModule.getJudgeProfileById(data.id);
            judgeUpdate = await judgeService.updateProfile(data, access, id, judgeProfile.results)
            if (judgeUpdate[0].status != constants.statusCode.ok)
                canUpdate = false;
                error = judgeUpdate[0].errors
        }
        common_function.updateTrans(canUpdate, sportsmanUpdate, coachUpdate, judgeUpdate)
        if (canUpdate) {
            res.status(constants.statusCode.ok).send(constants.msg.updateUserDetails)
        } else {
            //res.status(constants.statusCode.badRequest).send(constants.errorMsg.accessDenied)
            res.status(constants.statusCode.badRequest).send(error)
        }
    } else {
        res.status(constants.statusCode.badRequest).send(constants.errorMsg.accessDenied)
    }


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
        fs.copyFileSync(old_path, new_path)
        let path = undefined
        await googleDrive.uploadUserPicture(authGoogleDrive, id, new_path, picName, userType).then((res) => {
            fs.unlinkSync(new_path)
            path = constants.googleDrivePath.profilePicPath + res
        }).catch((err) => {
            console.log(err)
        });
        let userTypes = await userTypesModule.getUserTypes(id)
        let ans = new Object()
        for (const userType1 of userTypes.results) {
            ans = await userService.updateProfilePic(path, id, userType1.usertype);
        }
        res.status(ans.status).send(ans.results)
    });

});
/*
app.post("/private/uploadClubProfileImage/:id", async function (req, res) {
    //TODO : try to send to picture directly from the client
    // TODO : try to limit the size of the pic +send correct status of the upload
    let form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        let id = req.params.id;
        let picName = id + '_pic.jpeg';
        //let userType = "club";
        let old_path = files.file.path;
        let new_path = __dirname + '/resources/profilePics/' + picName;
        fs.copyFileSync(old_path, new_path)
        let path = undefined
        await googleDrive.uploadClubPicture(authGoogleDrive, id, new_path, picName).then((res) => {
            fs.unlinkSync(new_path)
            path = constants.googleDrivePath.profilePicPath + res
        }).catch((err) => {
            console.log(err)
        });
        let userTypes = await userTypesModule.getUserTypes(id)
        let ans = new Object()
        for (const userType1 of userTypes.results) {
            ans = await userService.updateProfilePic(path, id, userType1.usertype);
        }
        res.status(ans.status).send(ans.results)
    });

});*/
app.post("/private/uploadSportsmanFile/:id/:fileType", async function (req, res) {
    let form = new formidable.IncomingForm();
    let fileName = Date.now().toString() + ".pdf";
    let new_path = __dirname + '/resources/' + fileName;
    let path, ans;
    let id = req.params.id;
    await form.parse(req, async function (err, fields, files) {
        let old_path = files.file.path;
        await fs.copyFileSync(old_path, new_path)
        switch (req.params.fileType) {
            case 'medicalScan' :
                await googleDrive.uploadGoogleDriveFile(authGoogleDrive, id, new_path, fileName, 'sportsman', constants.googleDriveFolderNames.medical).then(async (res) => {
                    fs.unlinkSync(new_path)
                    path = constants.googleDrivePath.pdfPreviewPath + res + "/preview";
                }).catch((err) => {
                    console.log(err)
                });
                ans = await sportsmanFilesModule.updateMedicalScanDB(path, id);
                break;
            case 'healthInsurance' :
                await googleDrive.uploadGoogleDriveFile(authGoogleDrive, id, new_path, fileName, 'sportsman', constants.googleDriveFolderNames.insurance).then(async (res) => {
                    fs.unlinkSync(new_path)
                    path = constants.googleDrivePath.pdfPreviewPath + res + "/preview";
                }).catch((err) => {
                    console.log(err)
                });
                ans = await sportsmanFilesModule.updateHealthInsuranceDB(path, id);
                break;
            case 'moreFiles' :
                await googleDrive.uploadGoogleDriveFile(authGoogleDrive, id, new_path, fileName, 'sportsman', constants.googleDriveFolderNames.insurance).then(async (res) => {
                    fs.unlinkSync(new_path)
                    path = constants.googleDrivePath.pdfPreviewPath + res + "/preview";
                }).catch((err) => {
                    console.log(err)
                });
                ans = await sportsmanFilesModule.updatemoreFilesDB(path, id);
                break;
        }
        res.status(200).send("ok")
    });
});
app.get("/downloadSportsmanFile/:token/:fileId/:sportsmanId/:fileType", async function (req, res) {
    let fileId = req.params.fileId;
    decodeToken(req.params.token);
    if (access == constants.userType.MANAGER || access == constants.userType.COACH || id == req.params.sportsmanId)
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
            case 'moreFiles':
                await googleDrive.downloadFileFromGoogleDrive(authGoogleDrive, fileId, __dirname, req.params.sportsmanId, 'moreFiles.pdf')
                    .then(async (result) => {
                        res.downloadmoreFiles = util.promisify(res.download);
                        await res.downloadmoreFiles(result.path);
                        fs.unlink(result.path, function (err) {
                        })
                    });
                break;
        }

    else
        res.status(statusCode.badRequest).send(constants.errorMsg.accessDenied)
});
app.post("/private/uploadJudgeFile/:id/:fileType", async function (req, res) {
    let form = new formidable.IncomingForm();
    let fileName = Date.now().toString() + ".pdf";
    let new_path = __dirname + '/resources/' + fileName;
    let path, ans;
    let id = req.params.id;
    await form.parse(req, async function (err, fields, files) {
        let old_path = files.file.path;
        await fs.copyFileSync(old_path, new_path)
        switch (req.params.fileType) {
            case 'criminalRecord' :
                await googleDrive.uploadGoogleDriveFile(authGoogleDrive, id, new_path, fileName, 'judge', constants.googleDriveFolderNames.criminalRecord).then(async (res) => {
                    fs.unlinkSync(new_path)
                    path = constants.googleDrivePath.pdfPreviewPath + res + "/preview";
                }).catch((err) => {
                    console.log(err)
                });
                ans = await judgeFilesModule.updateCriminalRecordDB(path, id);
                break;
        }
        res.status(200).send("ok")
    });
});
app.get("/downloadJudgeFile/:token/:fileId/:judgeId/:fileType", async function (req, res) {
    let fileId = req.params.fileId;
    decodeToken(req.params.token);
    if (access == constants.userType.MANAGER || id == req.params.judgeId)
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
        res.status(statusCode.badRequest).send(constants.errorMsg.accessDenied)
});


//----------------------------------------------------------------------------------------------------------------------

//---------------------------------------------judging competition------------------------------------------------------
app.post("/private/judge/updateSportsmanCompetitionGrade", async function (req, res) {
    let details = req.body
    let ans = await judgementService.insertJudgeGradeForSportsman(details);
    res.status(ans.status).send(ans.results)

});
app.post("/private/judge/manualCloseCompetition", async function (req, res) {
    let idComp = req.body.idComp
    let ans = await competitionModule.manualCloseCompetition(idComp);
    res.status(ans.status).send(ans.results)

});
app.post("/private/judge/excelUpdateTaulloCompetitionGrade", async function (req, res) {
    let sportsmanGrade = req.body.sportsman;
    let idComp = req.body.idComp
    if (sportsmanGrade.length == 0)
        res.status(statusCode.badRequest).send({line: 0, errors: [constants.errorMsg.emptyExcel]});
    else {
        let judges = await competitionJudgeModule.getRegisteredJudgeForCompetition(idComp)
        judges = judges.results
        let numOfJudges = judges.length
        let checkData = competitionValidationService.checkExcelCompetitionsGrade(sportsmanGrade, constants.sportStyle.taullo, numOfJudges);
        if (checkData.isPassed) {
            let registerStatus = await judgementService.uploadTaulloCompetitionGrade(checkData.users, idComp, judges, numOfJudges);
            res.status(registerStatus.status).send(registerStatus.results);
        } else
            res.status(statusCode.badRequest).send(checkData.results);
    }
})
app.post("/private/manager/updateCompetitionGrades", async function (req, res) {
    let sportsman = req.body.grades
    let idComp = req.body.idComp
    let ans = await judgementService.updateCompetitionGrades(sportsman, idComp)
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
app.post("/private/allUsers/getAllMessages", async function (req, res) {
    let ans = await msgBoardModule.getAllMsg()
    res.status(ans.status).send(ans.results)

})
app.post("/private/allUsers/getMessageById", async function (req, res) {
    let ans = await msgBoardModule.getMsgById(req.body.msgId)
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/deleteMessage", async function (req, res) {
    let ans = await msgBoardModule.deleteMessage(req.body.msgId)
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/addMessage", async function (req, res) {
    let ans = await msgBoardModule.addMessage(req.body.msg)
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/editMessage", async function (req, res) {
    let ans = await msgBoardModule.editMessage(req.body.msg, req.body.msgId)
    res.status(ans.status).send(ans.results)

})

//------------------------------------------events-------------------------------------------------------------------
app.post("/private/allUsers/getAllEvents", async function (req, res) {
    let ans = await eventsModule.getAllEvents()
    res.status(ans.status).send(ans.results)

})
app.post("/private/allUsers/getEventById", async function (req, res) {
    let ans = await eventsModule.getEventById(req.body.eventId)
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/deleteEvent", async function (req, res) {
    let ans = await eventsModule.deleteEvent(req.body.eventId)
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/addEvent", async function (req, res) {
    let ans = await eventsModule.addEvent(req.body.event)
    res.status(ans.status).send(ans.results)

})
app.post("/private/manager/editEvent", async function (req, res) {
    let ans = await eventsModule.editEvent(req.body.event, req.body.eventId)
    res.status(ans.status).send(ans.results)

})

//start the server
server.listen(process.env.PORT || 3000, () => {
    console.log("Server has been started !!");
    console.log("port 3000");
    console.log("wu-shu project");
    console.log("----------------------------------");

});
