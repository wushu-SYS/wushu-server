const constants = require('../../constants')
const dbConnection = require('../../dbUtils').dbConnection

async function getCategories() {
    let ans = new Object();
    await dbConnection.query({
        sql:
            `Select * from category order by sex, minAge`,
    }).then(function (results) {
        ans.status = constants.statusCode.ok;
        ans.results = results.results
    }).catch(function (err) {
        console.log(err)
        ans.status = constants.statusCode.badRequest;
        ans.results = err
    });
    return ans;
}

async function addNewCategory(categoryDetails) {
    let ans = new Object();
    await dbConnection.query({
        sql: `INSERT INTO category (name,minAge,maxAge,sex)
                      VALUES (:categoryName,:minAge,:maxAge,:sex);`,
        params: {
            categoryName: categoryDetails.categoryName,
            minAge: categoryDetails.minAge ? categoryDetails.minAge : 0,
            maxAge: categoryDetails.maxAge,
            sex: categoryDetails.sex
        }
    }).then((results) => {
        ans.status = constants.statusCode.ok;
        ans.results = constants.msg.addCategory;
    }).catch((error) => {
        console.log(error)
        ans.status = constants.statusCode.badRequest;
        ans.results = error;
    })
    return ans;
}


module.exports.getCategories = getCategories
module.exports.addNewCategory = addNewCategory