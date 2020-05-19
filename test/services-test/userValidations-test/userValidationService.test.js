let assert = require('assert');
let constants = require('../../../constants')
let dataCheck = require('../../../implementation/services/userValidations/userValidationService')


describe('user validations service ', function () {


    it('should check for valid sportsman data user before register ', function () {
        let user ={
            "id": "111122234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "address": "כגדכ",
            "birthDate": "01/19/1995",
            "email": "dror@gmail.com",
            "sportClub": 7,
            "sex": "זכר",
            "sportStyle": "סנדא",
            "idCoach": 305077915
        }
        let res = dataCheck.checkDataBeforeRegister(user,constants.userType.sportsman)
        assert.equal(res.isPassed,true)
        assert.equal(res.results.length,0)
        assert.deepEqual(res.users ,user)

        user.id ="333"
         res = dataCheck.checkDataBeforeRegister(user,constants.userType.sportsman)
        assert.equal(res.isPassed,false)
        assert.equal(res.results.length,1)

        user ={
            "id": "1122234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "address": "כגדכ",
            "birthDate": "01/19/1995",
            "email": "dror@gmail.com",
            "sportClub": 7,
            "sex": "hhhh",
            "sportStyle": "סנדא",
            "idCoach": 305077915
        }

        res = dataCheck.checkDataBeforeRegister(user,constants.userType.sportsman)
        assert.equal(res.isPassed,false)
        assert.equal(res.results.length,1)
        assert.equal(res.results[0].errors.length,2)
        assert.equal(res.results[0].errors[0],constants.userError.idErr)
        assert.equal(res.results[0].errors[1],constants.userError.sexErr)

        user ={
            "id": "111122234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "address": "כגדכ",
            "birthDate": "01/19/1995",
            "email": null,
            "sportClub": 7,
            "sex": "זכר",
            "sportStyle": "סנדא",
            "idCoach": 305077915
        }
        res = dataCheck.checkDataBeforeRegister(user,constants.userType.sportsman)
        assert.equal(res.isPassed,false)
        assert.equal(res.results.length,1)
        assert.equal(res.results[0].errors.length,1)
        assert.equal(res.results[0].errors[0],constants.sportsManFields.emailErr)

    });
    it('should validate sportsman data before update', function () {
       let user ={
            "id": "111122234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "address": "כגדכ",
            "birthDate": "01/19/1995",
            "email": "dror@gmail.com",
            "sportClub": 7,
            "sex": "זכר",
            "sportStyle": "סנדא",
            "idCoach": 305077915
        }
        let res = dataCheck.validateUserDetails(user,constants.userType.sportsman)
        assert.equal(res.canUpdate,true)

        user ={
            "id": "1111sdf22234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "address": "כגדכ",
            "birthDate": "01/19/1995",
            "email": "dror@gmail.com",
            "sportClub": 7,
            "sex": "זכר",
            "sportStyle": "סנדא",
            "idCoach": 305077915
        }
        res = dataCheck.validateUserDetails(user,constants.userType.sportsman)
        assert.equal(res.canUpdate,false)


        user ={
            "id": "111122234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528ree272772",
            "address": "כגדכ",
            "birthDate": "01/19/1995",
            "email": "dror@gmail.com",
            "sportClub": 7,
            "sex": "זכר",
            "sportStyle": "סנדא",
            "idCoach": 305077915
        }
         res = dataCheck.validateUserDetails(user,constants.userType.sportsman)
        assert.equal(res.canUpdate,false)

    });

    it('should check for valid coach data user before register ', function () {
        let coach ={
            "id": "111122234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "address": "כגדכ",
            "birthDate": "01/19/1995",
            "email": "dror@gmail.com",
            "sportClub": 7,
        }
        let res = dataCheck.checkDataBeforeRegister(coach,constants.userType.coach)
        assert.equal(res.isPassed,true)
        assert.equal(res.results.length,0)
        assert.deepEqual(res.users ,coach)

        coach ={
            "id": "11112ff2234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "address": "כגדכ",
            "birthDate": "01/19/1995",
            "email": "dror@gmail.com",
            "sportClub": 7,
        }
         res = dataCheck.checkDataBeforeRegister(coach,constants.userType.coach)
        assert.equal(res.isPassed,false)
        assert.equal(res.results.length,1)
        assert.equal(res.results[0].errors.length,1)


    });
    it('should validate coach data before update', function () {
        let user ={
            "id": "111122234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "address": "כגדכ",
            "birthDate": "01/19/1995",
            "email": "dror@gmail.com",
            "sportClub": 7,
        }
        let res = dataCheck.validateUserDetails(user,constants.userType.coach)
        assert.equal(res.canUpdate,true)

        user ={
            "id": "11112fds2234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "address": "כגדכ",
            "birthDate": "01/19/1995",
            "email": "dror@gmail.com",
            "sportClub": 7,
        }
        res = dataCheck.validateUserDetails(user,constants.userType.coach)
        assert.equal(res.canUpdate,false)


        user ={
            "id": "11112fds2234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "052fds8272772",
            "address": "כגדכ",
            "birthDate": "01fds/19/1995",
            "email": "dror@gmail.com",
            "sportClub": 7,
        }
        res = dataCheck.validateUserDetails(user,constants.userType.coach)
        assert.equal(res.canUpdate,false)


    });


    it('should check for valid judge data user before register ', function () {
        let judge ={
            "id": "111122234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "email": "dror@gmail.com",
        }
        let res = dataCheck.checkDataBeforeRegister(judge,constants.userType.judge)
        assert.equal(res.isPassed,true)
        assert.equal(res.results.length,0)
        assert.deepEqual(res.users ,judge)

        judge ={
            "id": "11112ff2234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "email": "dror@gmail.com",
        }
        res = dataCheck.checkDataBeforeRegister(judge,constants.userType.judge)
        assert.equal(res.isPassed,false)
        assert.equal(res.results.length,1)
        assert.equal(res.results[0].errors.length,1)


    });
    it('should validate judge data before update', function () {
        let judge ={
            "id": "111122234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "email": "dror@gmail.com",
        }
        let res = dataCheck.validateUserDetails(judge,constants.userType.judge)
        assert.equal(res.canUpdate,true)

        judge ={
            "id": "11112fds2234",
            "firstName": "ניסיטן",
            "lastName": "ניזכ",
            "phone": "0528272772",
            "email": "dror@gmail.com",
        }
        res = dataCheck.validateUserDetails(judge,constants.userType.judge)
        assert.equal(res.canUpdate,false)

    });



});
