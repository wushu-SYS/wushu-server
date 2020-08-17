let assert = require('assert');
let constants = require('../../../constants')
let dataCheck = require('../../../implementation/services/userValidations/usersValidations')

describe('user data checks ', function () {

    describe('sportsman validations ', function () {
        it('should check for sportsman valid userId ( 9 digits )  ', function () {
            let id = 999999999
            let err = dataCheck.sportsman.idVal(id)
            assert.equal(err, undefined)

            id = 3333
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "fadfdag"
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "22222222"
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "222222"
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "aaaaaaa2"
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = ""
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = undefined
            err = dataCheck.sportsman.idVal(id)
            assert.equal(err, constants.sportsManFields.idErr)

        });
        it('shuld check for sportsman valid first name ', function () {
            let firstName = "שם"
            let err = dataCheck.sportsman.firstNameVal(firstName)
            assert.equal(err, undefined)

            firstName = "fdsgsd"
            err = dataCheck.sportsman.firstNameVal(firstName)
            assert.equal(err, constants.userError.firstNameHebErr)

            firstName = "32redsff"
            err = dataCheck.sportsman.firstNameVal(firstName)
            assert.equal(err, constants.userError.firstNameHebErr)


            err = dataCheck.sportsman.firstNameVal(undefined)
            assert.equal(err, constants.sportsManFields.firstNameErr)

        })
        it('shuld check for sportsman valid last name ', function () {
            let firstName = "שם"
            let err = dataCheck.sportsman.lastNameVal(firstName)
            assert.equal(err, undefined)

            firstName = "fdsgsd"
            err = dataCheck.sportsman.lastNameVal(firstName)
            assert.equal(err, constants.userError.lastNameHebErr)

            firstName = "32redsff"
            err = dataCheck.sportsman.lastNameVal(firstName)
            assert.equal(err, constants.userError.lastNameHebErr)


            err = dataCheck.sportsman.lastNameVal(undefined)
            assert.equal(err, constants.sportsManFields.lastNameErr)

        })
        it('should check for sportsman valid address ', function () {
            let address = "הבית שלי"
            let userType = constants.userType.sportsman
            let err = dataCheck.sportsman.addressVal(address, userType)
            assert.equal(err, undefined)

            address = "daffa"
            err = dataCheck.sportsman.addressVal(address, userType)
            assert.equal(err, constants.userError.addressErr)

            address = ""
            err = dataCheck.sportsman.addressVal(address, userType)
            assert.equal(err, constants.userError.addressErr)

            err = dataCheck.sportsman.addressVal(undefined, userType)
            assert.equal(err, constants.sportsManFields.addressErr)

        });
        it('should check for sportsman valid phone', function () {
            let phone = "0526555445"
            let userType = constants.userType.sportsman
            let err = dataCheck.sportsman.phoneVal(phone, userType)
            assert.equal(err, undefined)


            phone = "052o6555445"
            err = dataCheck.sportsman.phoneVal(phone, userType)
            assert.equal(err, constants.userError.phoneErr)

            phone = 4404444040
            err = dataCheck.sportsman.phoneVal(phone, userType)
            assert.equal(err, undefined)

            phone = ""
            err = dataCheck.sportsman.phoneVal(phone, userType)
            assert.equal(err, constants.userError.phoneErr)


            err = dataCheck.sportsman.phoneVal(undefined, userType)
            assert.equal(err, constants.sportsManFields.phoneErr)


        });
        it('should check for sportsman valid email', function () {

            let email = "aaa@gmail.com"
            let userType = constants.userType.sportsman
            let err = dataCheck.sportsman.emailVal(email, userType)
            assert.equal(err, undefined)

            email = "aaagmil.com"
            err = dataCheck.sportsman.emailVal(email, userType)
            assert.equal(err, constants.userError.emailErr)

            email = "42efdsf3333@fds"
            err = dataCheck.sportsman.emailVal(email, userType)
            assert.equal(err, constants.userError.emailErr)

            err = dataCheck.sportsman.emailVal(undefined, userType)
            assert.equal(err, constants.sportsManFields.emailErr)


        });
        it('should check for sportsman valid sport style', function () {
            let sportStyle = "טאולו"
            let err = dataCheck.sportsman.sportStyleVal(sportStyle)
            assert.equal(err, undefined)

            sportStyle = "סנדא"
            err = dataCheck.sportsman.sportStyleVal(sportStyle)
            assert.equal(err, undefined)

            sportStyle = "משולב"
            err = dataCheck.sportsman.sportStyleVal(sportStyle)
            assert.equal(err, undefined)


            sportStyle = ""
            err = dataCheck.sportsman.sportStyleVal(sportStyle)
            assert.equal(err, constants.userError.sportTypeErr)

            sportStyle = "גדשג"
            err = dataCheck.sportsman.sportStyleVal(sportStyle)
            assert.equal(err, constants.userError.sportTypeErr)

            err = dataCheck.sportsman.sportStyleVal(undefined)
            assert.equal(err, constants.sportsManFields.sportStyleErr)
        });
        it('should check for sportsman valid sport club', function () {
            let sportClub = "2"
            let err = dataCheck.sportsman.sportClubVal(sportClub)
            assert.equal(err, undefined)


            sportClub = "jjfds"
            err = dataCheck.sportsman.sportClubVal(sportClub)
            assert.equal(err, constants.userError.sportClubErr)



            err = dataCheck.sportsman.sportClubVal(undefined)
            assert.equal(err, constants.sportsManFields.sportClubErr)
        });
        it('should check for sportsman valid coachId ( 9 digits )  ', function () {
            let id = 999999999
            let err = dataCheck.sportsman.idCoachVal(id)
            assert.equal(err, undefined)

            id = 3333
            err = dataCheck.sportsman.idCoachVal(id)
            assert.equal(err, constants.userError.idCoachErr)

            id = "fadfdag"
            err = dataCheck.sportsman.idCoachVal(id)
            assert.equal(err, constants.userError.idCoachErr)

            id = "22222222"
            err = dataCheck.sportsman.idCoachVal(id)
            assert.equal(err, constants.userError.idCoachErr)

            id = "222222"
            err = dataCheck.sportsman.idCoachVal(id)
            assert.equal(err, constants.userError.idCoachErr)

            id = "aaaaaaa2"
            err = dataCheck.sportsman.idCoachVal(id)
            assert.equal(err, constants.userError.idCoachErr)

            id = ""
            err = dataCheck.sportsman.idCoachVal(id)
            assert.equal(err, constants.userError.idCoachErr)

            id = undefined
            err = dataCheck.sportsman.idCoachVal(id)
            assert.equal(err, constants.sportsManFields.idCoachErr)

        });
        it('should check for sportsman date  ', function () {
            let date = "24/01/1990"
            let err = dataCheck.sportsman.setBirthDate(date)
            assert.equal(err, undefined)

            err = dataCheck.sportsman.setBirthDate(undefined)
            assert.equal(err, constants.sportsManFields.birthDateErr)

        });
        it('should check for sportsman valid sex', function () {
            let sex = 'זכר'
            let err = dataCheck.sportsman.sexVal(sex)
            assert.equal(err,undefined)

            sex ="נקבה"
            err = dataCheck.sportsman.sexVal(sex)
            assert.equal(err,undefined)

            sex="fdsfsd"
            err = dataCheck.sportsman.sexVal(sex)
            assert.equal(err,constants.userError.sexErr)

            err = dataCheck.sportsman.sexVal(undefined)
            assert.equal(err,constants.sportsManFields.sexErr)

        });
    })

    describe('judge validations ', function () {
        it('should check for judge valid userId ( 9 digits )  ', function () {
            let id = 999999999
            let err = dataCheck.judge.idVal(id)
            assert.equal(err, undefined)

            id = 3333
            err = dataCheck.judge.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "fadfdag"
            err = dataCheck.judge.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "22222222"
            err = dataCheck.judge.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "222222"
            err = dataCheck.judge.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "aaaaaaa2"
            err = dataCheck.judge.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = ""
            err = dataCheck.judge.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = undefined
            err = dataCheck.judge.idVal(id)
            assert.equal(err, constants.sportsManFields.idErr)

        });
        it('shuld check for judge valid first name ', function () {
            let firstName = "שם"
            let err = dataCheck.judge.firstNameVal(firstName)
            assert.equal(err, undefined)

            firstName = "fdsgsd"
            err = dataCheck.judge.firstNameVal(firstName)
            assert.equal(err, constants.userError.firstNameHebErr)

            firstName = "32redsff"
            err = dataCheck.judge.firstNameVal(firstName)
            assert.equal(err, constants.userError.firstNameHebErr)


            err = dataCheck.judge.firstNameVal(undefined)
            assert.equal(err, constants.sportsManFields.firstNameErr)

        })
        it('shuld check for judge valid last name ', function () {
            let firstName = "שם"
            let err = dataCheck.judge.lastNameVal(firstName)
            assert.equal(err, undefined)

            firstName = "fdsgsd"
            err = dataCheck.judge.lastNameVal(firstName)
            assert.equal(err, constants.userError.lastNameHebErr)

            firstName = "32redsff"
            err = dataCheck.judge.lastNameVal(firstName)
            assert.equal(err, constants.userError.lastNameHebErr)


            err = dataCheck.judge.lastNameVal(undefined)
            assert.equal(err, constants.sportsManFields.lastNameErr)

        })
        it('should check for judge valid phone', function () {
            let phone = "0526555445"
            let userType = constants.userType.judge
            let err = dataCheck.judge.phoneVal(phone, userType)
            assert.equal(err, undefined)


            phone = "052o6555445"
            err = dataCheck.judge.phoneVal(phone, userType)
            assert.equal(err, constants.userError.phoneErr)

            phone = 4404444040
            err = dataCheck.judge.phoneVal(phone, userType)
            assert.equal(err, undefined)

            phone = ""
            err = dataCheck.judge.phoneVal(phone, userType)
            assert.equal(err, constants.userError.phoneErr)


            err = dataCheck.judge.phoneVal(undefined, userType)
            assert.equal(err, constants.sportsManFields.phoneErr)


        });
        it('should check for judge valid email', function () {

            let email = "aaa@gmail.com"
            let userType = constants.userType.judge
            let err = dataCheck.judge.emailVal(email, userType)
            assert.equal(err, undefined)

            email = "aaagmil.com"
            err = dataCheck.judge.emailVal(email, userType)
            assert.equal(err, constants.userError.emailErr)

            email = "42efdsf3333@fds"
            err = dataCheck.judge.emailVal(email, userType)
            assert.equal(err, constants.userError.emailErr)

            err = dataCheck.judge.emailVal(undefined, userType)
            assert.equal(err, constants.sportsManFields.emailErr)


        });

    })

    describe('coach validations ', function () {
        it('should check for coach valid userId ( 9 digits )  ', function () {
            let id = 999999999
            let err = dataCheck.coach.idVal(id)
            assert.equal(err, undefined)

            id = 3333
            err = dataCheck.coach.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "fadfdag"
            err = dataCheck.coach.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "22222222"
            err = dataCheck.coach.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "222222"
            err = dataCheck.coach.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = "aaaaaaa2"
            err = dataCheck.coach.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = ""
            err = dataCheck.coach.idVal(id)
            assert.equal(err, constants.userError.idErr)

            id = undefined
            err = dataCheck.coach.idVal(id)
            assert.equal(err, constants.sportsManFields.idErr)

        });
        it('shuld check for coach valid first name ', function () {
            let firstName = "שם"
            let err = dataCheck.coach.firstNameVal(firstName)
            assert.equal(err, undefined)

            firstName = "fdsgsd"
            err = dataCheck.coach.firstNameVal(firstName)
            assert.equal(err, constants.userError.firstNameHebErr)

            firstName = "32redsff"
            err = dataCheck.coach.firstNameVal(firstName)
            assert.equal(err, constants.userError.firstNameHebErr)


            err = dataCheck.coach.firstNameVal(undefined)
            assert.equal(err, constants.sportsManFields.firstNameErr)

        })
        it('shuld check for coach valid last name ', function () {
            let firstName = "שם"
            let err = dataCheck.coach.lastNameVal(firstName)
            assert.equal(err, undefined)

            firstName = "fdsgsd"
            err = dataCheck.coach.lastNameVal(firstName)
            assert.equal(err, constants.userError.lastNameHebErr)

            firstName = "32redsff"
            err = dataCheck.coach.lastNameVal(firstName)
            assert.equal(err, constants.userError.lastNameHebErr)


            err = dataCheck.coach.lastNameVal(undefined)
            assert.equal(err, constants.sportsManFields.lastNameErr)

        })
        it('should check for coach valid address ', function () {
            let address = "הבית שלי"
            let userType = constants.userType.coach
            let err = dataCheck.coach.addressVal(address, userType)
            assert.equal(err, undefined)

            address = "daffa"
            err = dataCheck.coach.addressVal(address, userType)
            assert.equal(err, constants.userError.addressErr)

            address = ""
            err = dataCheck.coach.addressVal(address, userType)
            assert.equal(err, constants.userError.addressErr)

            err = dataCheck.coach.addressVal(undefined, userType)
            assert.equal(err, constants.sportsManFields.addressErr)

        });
        it('should check for coach valid phone', function () {
            let phone = "0526555445"
            let userType = constants.userType.coach
            let err = dataCheck.coach.phoneVal(phone, userType)
            assert.equal(err, undefined)


            phone = "052o6555445"
            err = dataCheck.coach.phoneVal(phone, userType)
            assert.equal(err, constants.userError.phoneErr)

            phone = 4404444040
            err = dataCheck.coach.phoneVal(phone, userType)
            assert.equal(err, undefined)

            phone = ""
            err = dataCheck.coach.phoneVal(phone, userType)
            assert.equal(err, constants.userError.phoneErr)


            err = dataCheck.coach.phoneVal(undefined, userType)
            assert.equal(err, constants.sportsManFields.phoneErr)


        });
        it('should check for coach valid email', function () {

            let email = "aaa@gmail.com"
            let userType = constants.userType.coach
            let err = dataCheck.coach.emailVal(email, userType)
            assert.equal(err, undefined)

            email = "aaagmil.com"
            err = dataCheck.coach.emailVal(email, userType)
            assert.equal(err, constants.userError.emailErr)

            email = "42efdsf3333@fds"
            err = dataCheck.coach.emailVal(email, userType)
            assert.equal(err, constants.userError.emailErr)

            err = dataCheck.coach.emailVal(undefined, userType)
            assert.equal(err, constants.sportsManFields.emailErr)


        });
        it('should check for coach valid sport style', function () {
            let sportStyle = "טאולו"
            let err = dataCheck.coach.sportStyleVal(sportStyle)
            assert.equal(err, undefined)

            sportStyle = "סנדא"
            err = dataCheck.coach.sportStyleVal(sportStyle)
            assert.equal(err, undefined)

            sportStyle = "משולב"
            err = dataCheck.coach.sportStyleVal(sportStyle)
            assert.equal(err, undefined)


            sportStyle = ""
            err = dataCheck.coach.sportStyleVal(sportStyle)
            assert.equal(err, constants.userError.sportTypeErr)

            sportStyle = "גדשג"
            err = dataCheck.coach.sportStyleVal(sportStyle)
            assert.equal(err, constants.userError.sportTypeErr)

            err = dataCheck.coach.sportStyleVal(undefined)
            assert.equal(err, constants.sportsManFields.sportStyleErr)
        });
        it('should check for coach valid sport club', function () {
            let sportClub = "2"
            let err = dataCheck.coach.sportClubVal(sportClub)
            assert.equal(err, undefined)


            sportClub = "jjfds"
            err = dataCheck.sportsman.sportClubVal(sportClub)
            assert.equal(err, constants.userError.sportClubErr)


            err = dataCheck.coach.sportClubVal(undefined)
            assert.equal(err, constants.sportsManFields.sportClubErr)
        });
    })
});
