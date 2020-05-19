let assert = require('assert');
let constants = require('../constants')
let commonFunc = require('../implementation/commonFunc')

describe('common functions', function () {
    let json_test;
    let json_testArray;
    beforeEach(function () {
        json_test = {
            firstName: "name",
            lastName: "last"
        }
        json_testArray = [
            {
                firstName: "a",
                lastName: "ab"
            },
            {
                firstName: "c",
                lastName: "cv"
            }
        ]
    });
    it('should get array from json', function () {
        let res = commonFunc.getArrayFromJson(json_test)
        assert.equal(res[0], 'name');
        assert.equal(res[1], 'last');
        assert.equal(res.length, 2);
    });
    it('should get empty array from empty json', function () {
        let emptyJson = {}
        let res = commonFunc.getArrayFromJson(emptyJson)
        assert.equal(res.length, 0);
    });
    it('should get empty array from undefined object', function () {
        let res = commonFunc.getArrayFromJson(undefined)
        assert.equal(res.length, 0);
    });
    it('should get array from array json', function () {
        let res = commonFunc.getArrayFromJsonArray(json_testArray)
        assert.equal(res[0][0], 'a');
        assert.equal(res[0][1], 'ab');
        assert.equal(res[1][0], 'c');
        assert.equal(res[1][1], 'cv');
        assert.equal(res.length, 2);
        assert.equal(res[0].length, 2);
        assert.equal(res[1].length, 2);

    });
    it('should get array from array json with diff size of objects', function () {
        json_testArray = [
            {
                firstName: "a",
                lastName: "ab"
            },
            {
                firstName: "c",
            }
        ]
        let res = commonFunc.getArrayFromJsonArray(json_testArray)
        assert.equal(res[0][0], 'a');
        assert.equal(res[0][1], 'ab');
        assert.equal(res[1][0], 'c');
        assert.equal(res.length, 2);
        assert.equal(res[0].length, 2);
        assert.equal(res[1].length, 1);

    });
    it('should get empty array from empty array json ', function () {
        let res = commonFunc.getArrayFromJsonArray([])
        assert.equal(res.length, 0);
    });
    it('should get empty array from undefined array json ', function () {
        let res = commonFunc.getArrayFromJsonArray(undefined)
        assert.equal(res.length, 0);
    });

    it('should get date format as "mm/dd/yyyy" and return as "yyyy-mm-dd ', function () {
        let b_date = "07/28/1990"
        let res = commonFunc.setDateFormatRegisterUser(b_date)
        assert.equal(res, "1990-07-28")

    });
    it('should get date format as "mm/d/yyyy" and return as "yyyy-mm-d ', function () {
        let b_date = "07/2/1990"
        let res = commonFunc.setDateFormatRegisterUser(b_date)
        assert.equal(res, "1990-07-2")
    });
    it('should get undefined from date format as "mmd/yyyy" ', function () {
        let res = commonFunc.setDateFormatRegisterUser("033/1990")
        assert.equal(res, undefined)
    });
    it('should get undefined form  date format as string', function () {
        let res = commonFunc.setDateFormatRegisterUser("03/3f/1990")
        assert.equal(res, undefined)
    });
    it('should get undefined form  date format as undefined', function () {
        let res = commonFunc.setDateFormatRegisterUser(undefined)
        assert.equal(res, undefined)
    });

    it('should get age range from category Object  ', function () {
        let category = {
            minAge: 2,
            maxAge: 5
        }
        let res = commonFunc.getAgeRange(category)
        assert.equal(res, "2-5")

    })
    it('should get age range from category Object with no maxAge as "minAge+"  ', function () {
        let category = {
            minAge: 2,
        }
        let res = commonFunc.getAgeRange(category)
        assert.equal(res, "2+")
    })
    it('should get undefined  from category Object with no minAge att ', function () {
        let category = {
            x: 2,
        }
        let res = commonFunc.getAgeRange(category)
        assert.equal(res, undefined)
    })
    it('should get undefined  from undefined Object ', function () {
        let res = commonFunc.getAgeRange(undefined)
        assert.equal(res, undefined)
    })

    it('should return 1 if sportstyle is taullo or  both ', function () {
        assert.equal(commonFunc.setIsTaullo("טאולו"), 1)
        assert.equal(commonFunc.setIsTaullo("משולב"), 1)
    })
    it('should return 0 if sportstyle is sanda ', function () {
        assert.equal(commonFunc.setIsTaullo("סנדא"), 0)
    })
    it('should return 1 if sportstyle is sanda or  both ', function () {
        assert.equal(commonFunc.setIsSanda("משולב"), 1)
        assert.equal(commonFunc.setIsSanda("סנדא"), 1)

    })
    it('should return 0 if sportstyle is taullo ', function () {
        assert.equal(commonFunc.setIsSanda("טאולו"), 0)
    })

    it('should return undefined if sportstyle != constants.sportStyle', function () {
        assert.equal(commonFunc.setIsTaullo(undefined), undefined)
        assert.equal(commonFunc.setIsTaullo("fdsfsd"), undefined)
        assert.equal(commonFunc.setIsTaullo(0), undefined)
        assert.equal(commonFunc.setIsSanda(undefined), undefined)
        assert.equal(commonFunc.setIsSanda("fdsfsd"), undefined)
        assert.equal(commonFunc.setIsSanda(0), undefined)
    })
    it('should convert to sportstyle taullo | sanda | both', function () {
        let taullo = 1;
        let sanda = 0;
        let res = commonFunc.convertToSportStyle(taullo, sanda)
        assert.equal(res, 'טאולו')

        taullo = 1;
        sanda = 1;
        res = commonFunc.convertToSportStyle(taullo, sanda)
        assert.equal(res, 'משולב')

        taullo = 0;
        sanda = 1;
        res = commonFunc.convertToSportStyle(taullo, sanda)
        assert.equal(res, 'סנדא')

    });
    it('should return undefined from  sportstyle if is not true/false ', function () {
        let taullo = 5;
        let sanda = 5;
        let res = commonFunc.convertToSportStyle(taullo, sanda)
        assert.equal(res, undefined)

        taullo = "5";
        sanda = "5";
        res = commonFunc.convertToSportStyle(taullo, sanda)
        assert.equal(res, undefined)

        res = commonFunc.convertToSportStyle(undefined, undefined)
        assert.equal(res, undefined)
    });
    it('should return the current session year ', function () {
        let year = new Date().getFullYear();
        if (new Date().getMonth() < constants.monthDateFromZERO.SEPTEMBER)
            year = year - 1;

        assert.equal(year, commonFunc.getSessionYear())


    })

    it('should combine user by same categories', function () {
        let data = [{
            username: 'a',
            category: 1,
            categoryName: 'firstCategory',
            minAge: 2,
            maxAge: 10,
            categorySex: 'female'
        }, {
            username: 'a',
            category: 2,
            categoryName: 'secondCategory',
            minAge: 3,
            maxAge: 5,
            categorySex: 'female'
        }, {
            username: 'b',
            category: 1,
            categoryName: 'firstCategory',
            minAge: 2,
            maxAge: 10,
            categorySex: 'female'
        }]
        let res = commonFunc.sortUsers(data);
        assert.equal(res.length, 2);
        assert.deepEqual(res, [{
            category: {id: 1, name: 'firstCategory', minAge: 2, maxAge: 10, sex: 'female'},
            users: [{
                username: 'a',
                category: 1,
                categoryName: 'firstCategory',
                minAge: 2,
                maxAge: 10,
                categorySex: 'female'
            }, {
                username: 'b',
                category: 1,
                categoryName: 'firstCategory',
                minAge: 2,
                maxAge: 10,
                categorySex: 'female'
            }]
        }, {
            category: {id: 2, name: 'secondCategory', minAge: 3, maxAge: 5, sex: 'female'},
            users: [{
                username: 'a',
                category: 2,
                categoryName: 'secondCategory',
                minAge: 3,
                maxAge: 5,
                categorySex: 'female'
            }]
        }])
    });
    it('should return empty array form sortusers param undefined ', function () {

        let res = commonFunc.sortUsers(undefined);
        assert.equal(res.length, 0);
        assert.deepEqual(res,[])
    })
    it('should return empty array form sortusers empty users ', function () {
        let res = commonFunc.sortUsers([]);
        assert.equal(res.length, 0);
        assert.deepEqual(res,[])
    })


});
