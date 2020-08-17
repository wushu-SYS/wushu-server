let assert = require('assert');
let constants = require('../../constants')
let excelService = require('../../implementation/services/excelCreation')
let fs = require("fs");
//const coach = require("../../implementation/common/coaches_module");
//const manger_competition_module = require("../../implementation/manger/competition_module");
//const manger_sportsman_module = require("../../implementation/manger/sportsman_module");
//const common_sportsman_module = require("../../implementation/common/sportsman_module");
//const common_judge_module = require("../../implementation/common/judge_module");


//let db = require('../../dBUtils')

describe('excel creation service ', function () {

    it('should create and return instance of excel register for new Judge and path file and delete it after download ', async function () {
        let res = await excelService.createExcelRegisterNewJudge()
        assert.equal(fs.existsSync(res), true)
        fs.unlinkSync(res, function (err) {
        })
        assert.equal(fs.existsSync(res), false)
    });

    it('should create and return instance of excel register for new coaches ', async function () {

        let clubs = [
            {
                "id": 5,
                "name": "הפועל בת ים",
                "phone": "0514747776",
                "address": "בת ים",
                "contactname": "שושי שופר",
                "amutaId": 580371037,
                "agudaId": 1019,
                "ergonId": 3
            },
            {
                "id": 4,
                "name": "לוחמים בע\"מ",
                "phone": "0514744886",
                "address": "נס ציונה",
                "contactname": "מישל שחר",
                "amutaId": 999999999,
                "agudaId": 1007,
                "ergonId": 2
            },

        ]
        let res = await excelService.createExcelRegisterCoach(clubs)
        assert.equal(fs.existsSync(res), true)
        fs.unlinkSync(res, function (err) {
        })
        assert.equal(fs.existsSync(res), false)
    });

    it('should create and return instance of excel register for new sportsman ', async function () {

        let clubs = [
            {
                "id": 5,
                "name": "הפועל בת ים",
                "phone": "0514747776",
                "address": "בת ים",
                "contactname": "שושי שופר",
                "amutaId": 580371037,
                "agudaId": 1019,
                "ergonId": 3
            },
            {
                "id": 4,
                "name": "לוחמים בע\"מ",
                "phone": "0514744886",
                "address": "נס ציונה",
                "contactname": "מישל שחר",
                "amutaId": 999999999,
                "agudaId": 1007,
                "ergonId": 2
            },

        ]
        let coaches = [
            {
                "id": 322232424,
                "firstname": "לנה",
                "lastname": "גלקר",
                "phone": "0524324234",
                "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                "address": "קרית גת",
                "birthdate": "1990-03-04T00:00:00.000Z",
                "email": "lenag@gmail.com",
                "sportclub": 3
            },
            {
                "id": 305077910,
                "firstname": "אלכסנדר",
                "lastname": "פרנקל",
                "phone": "0528272772",
                "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                "address": "רחובות",
                "birthdate": "1990-03-04T00:00:00.000Z",
                "email": "alexanderp@gmail.com",
                "sportclub": 1
            }]
        let res = await excelService.createExcelRegisterSportsman(clubs, coaches)
        assert.equal(fs.existsSync(res), true)
        fs.unlinkSync(res, function (err) {
        })
        assert.equal(fs.existsSync(res), false)
    });

    it('should create and return instance of excel coaches ', async function () {

        let coaches = [
            {
                "id": 322232424,
                "firstname": "לנה",
                "lastname": "גלקר",
                "phone": "0524324234",
                "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                "address": "קרית גת",
                "birthdate": "1990-03-04T00:00:00.000Z",
                "email": "lenag@gmail.com",
                "sportclub": 3
            },
            {
                "id": 305077910,
                "firstname": "אלכסנדר",
                "lastname": "פרנקל",
                "phone": "0528272772",
                "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                "address": "רחובות",
                "birthdate": "1990-03-04T00:00:00.000Z",
                "email": "alexanderp@gmail.com",
                "sportclub": 1
            }]
        let res = await excelService.createCoachExcel(coaches)
        assert.equal(fs.existsSync(res), true)
        fs.unlinkSync(res, function (err) {
        })
        assert.equal(fs.existsSync(res), false)
    });

    it('should create and return instance of excel coaches as judge ', async function () {

        let coaches = [
            {
                "id": 322232424,
                "firstname": "לנה",
                "lastname": "גלקר",
                "phone": "0524324234",
                "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                "address": "קרית גת",
                "birthdate": "1990-03-04T00:00:00.000Z",
                "email": "lenag@gmail.com",
                "sportclub": 3
            },
            {
                "id": 305077910,
                "firstname": "אלכסנדר",
                "lastname": "פרנקל",
                "phone": "0528272772",
                "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                "address": "רחובות",
                "birthdate": "1990-03-04T00:00:00.000Z",
                "email": "alexanderp@gmail.com",
                "sportclub": 1
            }]
        let res = await excelService.createExcelCoachAsJudge(coaches)
        assert.equal(fs.existsSync(res), true)
        fs.unlinkSync(res, function (err) {
        })
        assert.equal(fs.existsSync(res), false)
    });

    it('should create and return instance of excel competition state ', async function () {
        let data = [
            {
                "category": {
                    "id": 20,
                    "name": "מבחן קבוצה נסטיה",
                    "minAge": 0,
                    "maxAge": null,
                    "sex": "מעורב"
                },
                "users": [
                    {
                        "id": 111111111,
                        "firstname": "איתי",
                        "lastname": "מטל",
                        "category": 20,
                        "categoryName": "מבחן קבוצה נסטיה",
                        "minAge": 0,
                        "maxAge": null,
                        "categorySex": "מעורב",
                        "isDeleted": false,
                        "sex": "זכר",
                        "age": 30,
                        "sportclub": 2,
                        "indx": 1
                    },
                    {
                        "id": 222222222,
                        "firstname": "אריאל",
                        "lastname": "לוין",
                        "category": 20,
                        "categoryName": "מבחן קבוצה נסטיה",
                        "minAge": 0,
                        "maxAge": null,
                        "categorySex": "מעורב",
                        "isDeleted": false,
                        "sex": "זכר",
                        "age": 30,
                        "sportclub": 2,
                        "indx": 2
                    },
                    {
                        "id": 233333333,
                        "firstname": "אוהד",
                        "lastname": "עבדי",
                        "category": 20,
                        "categoryName": "מבחן קבוצה נסטיה",
                        "minAge": 0,
                        "maxAge": null,
                        "categorySex": "מעורב",
                        "isDeleted": false,
                        "sex": "זכר",
                        "age": 29,
                        "sportclub": 1,
                        "indx": 3
                    },
                    {
                        "id": 666666666,
                        "firstname": "יואב",
                        "lastname": "באבדניץ",
                        "category": 20,
                        "categoryName": "מבחן קבוצה נסטיה",
                        "minAge": 0,
                        "maxAge": null,
                        "categorySex": "מעורב",
                        "isDeleted": false,
                        "sex": "זכר",
                        "age": 30,
                        "sportclub": 1,
                        "indx": 4
                    }
                ]
            },
            {
                "category": {
                    "id": 21,
                    "name": "נשק בנות",
                    "minAge": 15,
                    "maxAge": 16,
                    "sex": "נקבה"
                },
                "users": [
                    {
                        "id": 214485229,
                        "firstname": "רבקה",
                        "lastname": "גיטין",
                        "category": 21,
                        "categoryName": "נשק בנות",
                        "minAge": 15,
                        "maxAge": 16,
                        "categorySex": "נקבה",
                        "isDeleted": false,
                        "sex": "נקבה",
                        "age": 16,
                        "sportclub": 3,
                        "indx": 5
                    },
                    {
                        "id": 326495520,
                        "firstname": "אביטל",
                        "lastname": "זסלבסקי",
                        "category": 21,
                        "categoryName": "נשק בנות",
                        "minAge": 15,
                        "maxAge": 16,
                        "categorySex": "נקבה",
                        "isDeleted": false,
                        "sex": "נקבה",
                        "age": 16,
                        "sportclub": 3,
                        "indx": 6
                    }
                ]
            }
        ]

        let res = await excelService.createExcelCompetitionState(data, "03")
        assert.equal(fs.existsSync(res), true)
        fs.unlinkSync(res, function (err) {
        })
        assert.equal(fs.existsSync(res), false)
    });

    it('should create and return instance of excel register competition ', async function () {
        let categoryData = [
            {
                "id": 24,
                "name": "צאן סואן חלקי בנים",
                "minAge": 6,
                "maxAge": 7,
                "sex": "זכר"
            },
            {
                "id": 34,
                "name": "דואן בנים",
                "minAge": 6,
                "maxAge": 6,
                "sex": "זכר"
            },
            {
                "id": 33,
                "name": "דואן בנים",
                "minAge": 7,
                "maxAge": 8,
                "sex": "זכר"
            },
            {
                "id": 32,
                "name": "נשק בנים",
                "minAge": 8,
                "maxAge": 10,
                "sex": "זכר"
            },
            {
                "id": 23,
                "name": "צאן סואן חלקי בנים",
                "minAge": 8,
                "maxAge": 9,
                "sex": "זכר"
            },
            {
                "id": 29,
                "name": "נשק חלקי בנים",
                "minAge": 8,
                "maxAge": 8,
                "sex": "זכר"
            },
            {
                "id": 37,
                "name": "צאן סואן בנים",
                "minAge": 9,
                "maxAge": 10,
                "sex": "זכר"
            }]
        let sportsManData = {
            "sportsmen": [
                {
                    "id": 214485229,
                    "firstname": "רבקה",
                    "lastname": "גיטין",
                    "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                    "category": 21,
                    "idCompetition": 3,
                    "sex": "נקבה",
                    "age": 16,
                    "sportclub": 3
                },
                {
                    "id": 209831239,
                    "firstname": "כרמל ",
                    "lastname": "אוקון",
                    "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                    "category": null,
                    "idCompetition": null,
                    "sex": "נקבה",
                    "age": 19,
                    "sportclub": 3
                },
                {
                    "id": 327563862,
                    "firstname": "יגאל",
                    "lastname": "חודצנקו",
                    "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                    "category": 22,
                    "idCompetition": 3,
                    "sex": "זכר",
                    "age": 15,
                    "sportclub": 3
                },
                {
                    "id": 326495520,
                    "firstname": "אביטל",
                    "lastname": "זסלבסקי",
                    "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                    "category": 21,
                    "idCompetition": 3,
                    "sex": "נקבה",
                    "age": 16,
                    "sportclub": 3
                },
                {
                    "id": 215241241,
                    "firstname": "רון",
                    "lastname": "פלדמן",
                    "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                    "category": null,
                    "idCompetition": null,
                    "sex": "זכר",
                    "age": 15,
                    "sportclub": 3
                },
                {
                    "id": 214507378,
                    "firstname": "יעל ",
                    "lastname": "בסנביץ",
                    "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                    "category": 21,
                    "idCompetition": 3,
                    "sex": "נקבה",
                    "age": 16,
                    "sportclub": 3
                },
                {
                    "id": 216500397,
                    "firstname": "יעל ",
                    "lastname": "קימיאגרוב",
                    "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                    "category": null,
                    "idCompetition": null,
                    "sex": "נקבה",
                    "age": 13,
                    "sportclub": 3
                },
                {
                    "id": 331713966,
                    "firstname": "יעל ",
                    "lastname": "גלקר",
                    "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                    "category": null,
                    "idCompetition": null,
                    "sex": "נקבה",
                    "age": 12,
                    "sportclub": 3
                },
                {
                    "id": 330824855,
                    "firstname": "אריקה",
                    "lastname": "קוגן",
                    "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                    "category": null,
                    "idCompetition": null,
                    "sex": "נקבה",
                    "age": 13,
                    "sportclub": 3
                },
                {
                    "id": 328148705,
                    "firstname": "מאיה",
                    "lastname": "אוזילוב",
                    "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                    "category": null,
                    "idCompetition": null,
                    "sex": "נקבה",
                    "age": 13,
                    "sportclub": 3
                }]
        }

        let res = await excelService.createExcelRegisterCompetition(sportsManData, categoryData)
        assert.equal(fs.existsSync(res), true)
        fs.unlinkSync(res, function (err) {
        })
        assert.equal(fs.existsSync(res), false)
    });

    it('should create and return instance of excel sportsman ', async function () {
        let sportsManData = [
            {
            "id": 214485229,
                "firstname": "רבקה",
                "lastname": "גיטין",
                "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
                "category": 21,
                "idCompetition": 3,
                "sex": "נקבה",
                "age": 16,
                "sportclub": 3,
                "competitionCount" :4
        },
        {
            "id": 209831239,
            "firstname": "כרמל ",
            "lastname": "אוקון",
            "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
            "category": null,
            "idCompetition": null,
            "sex": "נקבה",
            "age": 19,
            "sportclub": 3,
            "competitionCount" :4

        },
        {
            "id": 327563862,
            "firstname": "יגאל",
            "lastname": "חודצנקו",
            "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
            "category": 22,
            "idCompetition": 3,
            "sex": "זכר",
            "age": 15,
            "sportclub": 3,
            "competitionCount" :4

        }
        ]
        let res = await excelService.createSportsmenExcel(sportsManData)
        assert.equal(fs.existsSync(res), true)
        fs.unlinkSync(res, function (err) {
        })
        assert.equal(fs.existsSync(res), false)
    });

    it('should create and return instance of excel judge ', async function () {
       let judge =[
           {
               "id": 322232424,
               "firstname": "לנה",
               "lastname": "גלקר",
               "phone": "0524324234",
               "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
               "email": "lenag@gmail.com"
           },
           {
               "id": 305077910,
               "firstname": "אלכסנדר",
               "lastname": "פרנקל",
               "phone": "0528272772",
               "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
               "email": "alexanderp@gmail.com"
           },
           {
               "id": 305077911,
               "firstname": "בארוך",
               "lastname": "סגל",
               "phone": "0528272772",
               "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
               "email": "barohs@gmail.com"
           },
           {
               "id": 305077912,
               "firstname": "מישל",
               "lastname": "שחר",
               "phone": "0528272772",
               "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
               "email": "michelesh@gmail.com"
           },
           {
               "id": 305077913,
               "firstname": "שושי",
               "lastname": "שופר",
               "phone": "0528272772",
               "photo": "https://drive.google.com/uc?id=1N6w5EY8m6haL0ijtHW7Sgbu8W96S0GYW",
               "email": "shoshish@gmail.com"
           }
       ]

        let res = await excelService.createJudgeExcel(judge)
        assert.equal(fs.existsSync(res), true)
        fs.unlinkSync(res, function (err) {
        })
        assert.equal(fs.existsSync(res), false)
    });



});


