var app =require ("express")();
var DButilsAzure = require('./DButils');
var bodyParser = require("body-parser");


const jwt = require("jsonwebtoken");
const Cryptr = require('cryptr');
secret = "wushuSecret";
const cryptr = new Cryptr(secret);
const validation = require('node-input-validator');
const mutual_user_module = require("./Mutual/user_module");
const coach_user_module = require("./Coach/user_module");
const sportsman_user_module = require("./Sportsman/user_module");

app.use(bodyParser.urlencoded({extend:true}));
app.use(bodyParser.json());
app.use("/private", (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) res.status(401).send("Access denied. No token provided.");
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
        next();
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
});
app.post("/login", (req, res) => {
    mutual_user_module._login(req, res)
});
app.post("/private/registerSportman", function(req, res){
    if(jwt.decode(req.header("x-auth-token")).access!=3)
        coach_user_module._registerSportman(req,res)
    else
        res.status(400).send("Permission denied");
});

const multer = require('multer');
global.__basedir = __dirname;
const storagePhoto = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + '/uploads/Photos/')
    },
    filename: (req, file, cb) => {
        cb(null, String(jwt.decode(req.header("x-auth-token")).id+".jpeg"))
    }
});
const uploadMedical = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + '/uploads/Sportsman/MedicalScan/')
    },
    filename: (req, file, cb) => {
        cb(null, String(jwt.decode(req.header("x-auth-token")).id+".jpeg"))
    }
});
const uploadInsurance = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + '/uploads/Sportsman/InsuranceScan/')
    },
    filename: (req, file, cb) => {
        cb(null, String(jwt.decode(req.header("x-auth-token")).id+".jpeg"))
    }
});

const uploadPhotos = multer({storage: storagePhoto});
const uploadMedicals = multer({storage: uploadMedical});
const uploadInsurances=multer({storage: uploadInsurance})

app.post('/private/uploadPhoto', uploadPhotos.single("userphoto"), (req, res) =>{
    mutual_user_module._uploadPhoto(req,res);
});

app.post('/private/uploadMedicalFile', uploadMedicals.single("file"), (req, res) =>{
    sportsman_user_module._uploadeMedical(req,res);
});

app.post('/private/uploadInsurance', uploadInsurances.single("file"), (req, res) =>{
    sportsman_user_module._uploadInsurances(req,res);
});

//start the server
app.listen(3000,()=>{
    console.log("Server has been started !!");
    console.log("port 3000");
    console.log("wu-shu project");
    console.log("----------------------------------");
});

/*var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'rootPROJ9',
    database : 'wushudb'
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

connection.query('SELECT * from competitions', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
});

connection.end();*/