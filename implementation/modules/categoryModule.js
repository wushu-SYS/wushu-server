const constants = require('../../constants')

async function getCategories() {
    let ans = new Object();
    await dbUtils.sql(`Select * from category order by sex, minAge`)
        .execute()
        .then(function (results) {
            ans.status = constants.statusCode.ok;
            ans.results = results
        }).fail(function (err) {
            ans.status = constants.statusCode.badRequest;
            ans.results = err
        });
    return ans;
}

async function addNewCategory(categoryDetails) {
    let ans = new Object();
    await dbUtils.sql(`INSERT INTO category (name,minAge,maxAge,sex)
                      VALUES (@categoryName,@minAge,@maxAge,@sex);`)
        .parameter('categoryName', tediousTYPES.NVarChar, categoryDetails.categoryName)
        .parameter('minAge', tediousTYPES.Int, categoryDetails.minAge ? categoryDetails.minAge : 0)
        .parameter('maxAge', tediousTYPES.Int, categoryDetails.maxAge)
        .parameter('sex', tediousTYPES.NVarChar, categoryDetails.sex)
        .execute()
        .then((results) => {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.addCategory;
        })
        .fail((error) => {
            ans.status = Constants.statusCode.badRequest;
            ans.results = error;
        })
    return ans;
}


module.exports.getCategories = getCategories
module.exports.addNewCategory = addNewCategory