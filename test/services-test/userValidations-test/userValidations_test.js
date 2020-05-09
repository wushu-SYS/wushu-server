let assert = require('assert');
let constants = require('../../../constants')
let dataCheck = require('../../../implementation/services/userValidations/usersValidations')

describe('user data checks ', function () {

    describe('sportsman validations ', function () {
        it('should check for sportsman valid userId ( 9 digits )  ', function () {
            let id = 999999999
            let err = dataCheck.sportsman.idVal(id)
            assert.equal(err,undefined)

            id = 3333
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "fadfdag"
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "22222222"
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "222222"
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "aaaaaaa2"
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = ""
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = undefined
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err,constants.sportsManFields.idErr)

        });
        it('shuld check for sportsman valid first name ',function () {
             let firstName = "שם"
             let err = dataCheck.sportsman.firstNameVal(firstName)
             assert.equal(err,undefined)

            firstName = "fdsgsd"
            err = dataCheck.sportsman.firstNameVal(firstName)
            assert.equal(err,constants.userError.firstNameHebErr)

            firstName = "32redsff"
            err = dataCheck.sportsman.firstNameVal(firstName)
            assert.equal(err,constants.userError.firstNameHebErr)


            err = dataCheck.sportsman.firstNameVal(undefined)
            assert.equal(err, constants.sportsManFields.firstNameErr)

        })
        it('shuld check for sportsman valid last name ',function () {
            let firstName = "שם"
            let err = dataCheck.sportsman.lastNameVal(firstName)
            assert.equal(err,undefined)

            firstName = "fdsgsd"
            err = dataCheck.sportsman.lastNameVal(firstName)
            assert.equal(err,constants.userError.lastNameHebErr)

            firstName = "32redsff"
            err = dataCheck.sportsman.lastNameVal(firstName)
            assert.equal(err,constants.userError.lastNameHebErr)


            err = dataCheck.sportsman.lastNameVal(undefined)
            assert.equal(err, constants.sportsManFields.lastNameErr)

        })

    })

    describe('judge validations ', function () {
        it('should check for judge valid userId ( 9 digits )  ', function () {
            let id = 999999999
            let err = dataCheck.judge.idVal(id)
            assert.equal(err,undefined)

            id = 3333
            err = dataCheck.judge.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "fadfdag"
            err = dataCheck.judge.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "22222222"
            err = dataCheck.judge.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "222222"
            err = dataCheck.judge.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "aaaaaaa2"
            err = dataCheck.judge.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = ""
            err = dataCheck.judge.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = undefined
            err = dataCheck.judge.idVal(id)
            assert.equal(err,constants.sportsManFields.idErr)

        });
        it('shuld check for judge valid first name ',function () {
            let firstName = "שם"
            let err = dataCheck.judge.firstNameVal(firstName)
            assert.equal(err,undefined)

            firstName = "fdsgsd"
            err = dataCheck.judge.firstNameVal(firstName)
            assert.equal(err,constants.userError.firstNameHebErr)

            firstName = "32redsff"
            err = dataCheck.judge.firstNameVal(firstName)
            assert.equal(err,constants.userError.firstNameHebErr)


            err = dataCheck.judge.firstNameVal(undefined)
            assert.equal(err, constants.sportsManFields.firstNameErr)

        })
        it('shuld check for judge valid last name ',function () {
            let firstName = "שם"
            let err = dataCheck.judge.lastNameVal(firstName)
            assert.equal(err,undefined)

            firstName = "fdsgsd"
            err = dataCheck.judge.lastNameVal(firstName)
            assert.equal(err,constants.userError.lastNameHebErr)

            firstName = "32redsff"
            err = dataCheck.judge.lastNameVal(firstName)
            assert.equal(err,constants.userError.lastNameHebErr)


            err = dataCheck.judge.lastNameVal(undefined)
            assert.equal(err, constants.sportsManFields.lastNameErr)

        })

    })

    describe('coach validations ', function () {
        it('should check for coach valid userId ( 9 digits )  ', function () {
            let id = 999999999
            let err = dataCheck.coach.idVal(id)
            assert.equal(err,undefined)

            id = 3333
            err = dataCheck.coach.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "fadfdag"
            err = dataCheck.coach.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "22222222"
            err = dataCheck.coach.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "222222"
            err = dataCheck.coach.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = "aaaaaaa2"
            err = dataCheck.coach.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = ""
            err = dataCheck.coach.idVal(id)
            assert.equal(err,constants.userError.idErr)

            id = undefined
            err = dataCheck.coach.idVal(id)
            assert.equal(err,constants.sportsManFields.idErr)

        });
        it('shuld check for coach valid first name ',function () {
            let firstName = "שם"
            let err = dataCheck.coach.firstNameVal(firstName)
            assert.equal(err,undefined)

            firstName = "fdsgsd"
            err = dataCheck.coach.firstNameVal(firstName)
            assert.equal(err,constants.userError.firstNameHebErr)

            firstName = "32redsff"
            err = dataCheck.coach.firstNameVal(firstName)
            assert.equal(err,constants.userError.firstNameHebErr)


            err = dataCheck.coach.firstNameVal(undefined)
            assert.equal(err, constants.sportsManFields.firstNameErr)

        })
        it('shuld check for coach valid last name ',function () {
            let firstName = "שם"
            let err = dataCheck.coach.lastNameVal(firstName)
            assert.equal(err,undefined)

            firstName = "fdsgsd"
            err = dataCheck.coach.lastNameVal(firstName)
            assert.equal(err,constants.userError.lastNameHebErr)

            firstName = "32redsff"
            err = dataCheck.coach.lastNameVal(firstName)
            assert.equal(err,constants.userError.lastNameHebErr)


            err = dataCheck.coach.lastNameVal(undefined)
            assert.equal(err, constants.sportsManFields.lastNameErr)

        })


    })
});
