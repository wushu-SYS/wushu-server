DButilsAzure = require('./dBUtils');
Constants = require('./constants');
var app = require("express")();
var bodyParser = require("body-parser");
var cors = require('cors');
jwt = require("jsonwebtoken");
validator = require('validator');

secret = "wushuSecret";
const multer = require('multer');
var schedule = require('node-schedule');

global.__basedir = __dirname;

let id, access;


//import all modules
const common_couches_module = require("./implementation/common/couches_module");
const common_sportclub_module = require("./implementation/common/sportclub_module");
const common_sportsman_module = require("./implementation/common/sportsman_module");
const common_user_module = require("./implementation/common/user_module");
const common_competition_module = require("./implementation/common/competition_module");

const coach_sportsman_module = require("./implementation/coach/sportsman_module");
const coach_user_module = require("./implementation/coach/user_module");
const coach_competition_module = require("./implementation/coach/competition_module");

const manger_sportsman_module = require("./implementation/manger/sportsman_module");
const manger_user_module = require("./implementation/manger/user_module");
const manger_competition_module = require("./implementation/manger/competition_module");

const sportsman_user_module = require("./implementation/sportsman/user_module");


//server schedule Jobs
var automaticCloseCompetition = schedule.scheduleJob({hour: 2}, function () {
    manger_competition_module._autoCloseRegCompetition();
});

//app uses
app.use(bodyParser.urlencoded({extend: true}));
app.use(bodyParser.json());
app.use(cors())
app.use("/private", (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) res.status(401).send("Access denied. No token provided.");
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;

        access = jwt.decode(req.header("x-auth-token")).access;
        id = jwt.decode(req.header("x-auth-token")).id;

        next();
    } catch (exception) {
        console.log(token)
        res.status(400).send("Invalid token. Permission denied");
    }
});


//app options
app.options('*', cors())


app.post("/login", async (req, res) => {
    let ans = await common_user_module.checkUserDetailsForLogin(req.body);
    if (!ans.isPassed)
        res.status(Constants.statusCode.unauthorized).send(ans.err);
    else {
        let userDetails = await common_user_module.getUserDetails(ans);
        let token = common_user_module.buildToken(userDetails, ans);
        res.status(Constants.statusCode.ok).send(token)
    }
});

app.post("/private/registerSportsman", async function (req, res) {
    if (access !== userType.SPORTSMAN) {
        var ans = await coach_user_module._registerSportman(req.body);
        if (!ans.isPassed)
            res.send(ans.err)
        res.send(ans.results)
    } else
        res.status(400).send("Permission denied");
});

app.post("/private/registerCoach", function (req, res) {
    if (access === userType.MANAGER)
        manger_user_module._registerCoach(req, res);
    else
        res.status(400).send("Permission denied")

});

const storagePhoto = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + '/uploads/Photos/')
    },
    filename: (req, file, cb) => {
        cb(null, String(id + ".jpeg"))
    }
});
const uploadMedical = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + '/uploads/sportsman/MedicalScan/')
    },
    filename: (req, file, cb) => {
        cb(null, String(id + ".jpeg"))
    }
});
const uploadInsurance = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + '/uploads/sportsman/InsuranceScan/')
    },
    filename: (req, file, cb) => {
        cb(null, String(id + ".jpeg"))
    }
});
const uploadPhotos = multer({storage: storagePhoto});
const uploadMedicals = multer({storage: uploadMedical});
const uploadInsurances = multer({storage: uploadInsurance});
app.post('/private/uploadPhoto', uploadPhotos.single("userphoto"), (req, res) => {
    common_user_module._uploadPhoto(req, res);
});
app.post('/private/uploadMedicalFile', uploadMedicals.single("userMedical"), (req, res) => {
    sportsman_user_module._uploadeMedical(req, res);
});
app.post('/private/uploadInsurance', uploadInsurances.single("userInsurance"), (req, res) => {
    sportsman_user_module._uploadInsurances(req, res);
});

app.get('/downloadExcelFormatSportsman', (req, res) => {
    res.download('resources/files/sportsmanExcel.xlsx');
});
app.get('/downloadExcelFormatCoach', (req, res) => {
    res.download('resources/files/coachExcel.xlsx');
});

app.post("/private/changePassword", async function (req, res) {
    let userData = {
        id: jwt.decode(req.header("x-auth-token")).id,
        newPass: req.body.password
    }
    let ans = await common_user_module.validateDiffPass(userData);
    if (ans.isPassed) {
        ans = await common_user_module.changeUserPassword(userData);
        res.status(ans.status).send(ans.results)
    } else
        res.status(Constants.statusCode.badRequest).send(ans.err)
});

app.post("/private/getCoaches", async function (req, res) {
    if (access !== Constants.userType.SPORTSMAN) {
        let ans = await common_couches_module.getCoaches();
        res.status(ans.status).send(ans.results);
    } else
        res.status(Constants.statusCode.badRequest).send(Constants.errorMsg.accessDenied);
});

app.post("/private/getSportsmen", async function (req, res) {
    let ans;
    if (access === Constants.userType.MANAGER)
        ans = await manger_sportsman_module.getSportsmen(req.query);
    else if (access === Constants.userType.COACH)
        ans = await coach_sportsman_module.getSportsmen(req.query, id);
    res.status(ans.status).send(ans.results);

});


app.post("/private/getClubs", function (req, res) {
    if (access !== userType.SPORTSMAN)
        common_sportclub_module._getSportClubs(req, res);
    else
        res.status(400).send("Permission denied");
});
app.post("/private/getCategories", function (req, res) {
    common_sportsman_module._getCategories(req, res);
});

app.post("/private/sportsmanProfile", function (req, res) {
    if (req.body.id !== undefined && access === userType.SPORTSMAN && id !== req.body.id)
        res.status(400).send("Permission denied");
    else {
        if (req.body.id !== undefined)
            common_sportsman_module._sportsmanProfile(req.body.id, res);
        else
            common_sportsman_module._sportsmanProfile(id, res);
    }
});
app.post("/private/addCompetition", function (req, res) {
    if (access === userType.MANAGER)
        manger_competition_module._addCompetition(req, res);
    else
        res.status(400).send("Permission denied")
});

app.post("/private/getCompetitions", function (req, res) {
    if (access === userType.MANAGER || access === userType.COACH)
        manger_competition_module._getCompetitions(req, res);
    else
        res.status(400).send("Permission denied")

})
app.post("/private/getCompetitionDetail", function (req, res) {
    if (access === userType.MANAGER || access === userType.COACH || access === userType.SPORTSMAN)
        common_competition_module._getDetail(req, res);
    else
        res.status(400).send("Permission denied")

})

app.post("/private/getCoachSportsman", function (req, res) {
    if (access === userType.COACH)
        coach_competition_module._getCoachSportsman(req, res, id);
    else if (access === userType.MANAGER)
        manger_competition_module._getAllSportsman(req, res);
    else
        res.status(400).send("Permission denied")


})

app.post("/private/competitionSportsmen", function (req, res) {
    if (access !== userType.SPORTSMAN)
        common_competition_module._registerSportsmenToCompetition(req, res);
})

app.post("/private/deleteSportsmanProfile", function (req, res) {
    if (access === userType.MANAGER || id === req.body.userID)
        common_user_module.deleteSportsman(req, res)
    else
        res.status(400).send("Permission denied")
})

app.post("/private/updateSportsmanProfile", function (req, res) {
    if (access === userType.MANAGER || id === req.body.id)
        sportsman_user_module._updateSportsmanProfile(req, res)
    else
        res.status(400).send("Permission denied")
});

app.post("/private/getRegistrationState", function (req, res) {
    if (access === userType.MANAGER || access === userType.COACH)
        manger_competition_module._getRegistrationState(req, res);
    else
        res.status(400).send("Permission denied")
});

app.post("/private/setCategoryRegistration", function (req, res) {
    if (access === userType.MANAGER)
        manger_competition_module._setCategoryRegistration(req, res);
    else
        res.status(400).send("Permission denied")
});

app.post("/private/closeRegistration", function (req, res) {
    if (access === userType.MANAGER)
        manger_competition_module._closeRegistration(req, res);
    else
        res.status(400).send("Permission denied")
})
app.post("/private/addNewCategory", function (req, res) {
    if (access === userType.MANAGER)
        manger_competition_module._addNewCategory(req, res);
    else
        res.status(400).send("Permission denied")
})

app.post("/private/updateCompetitionDetails", function (req, res) {
    if (access === userType.MANAGER)
        manger_competition_module._updateCompetitionDetails(req, res);
    else
        res.status(400).send("Permission denied")
})

//start the server
app.listen(3000, () => {
    console.log("Server has been started !!");
    console.log("port 3000");
    console.log("wu-shu project");
    console.log("----------------------------------");
});