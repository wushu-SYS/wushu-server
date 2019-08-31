const common_sportsman_module = require('../common/sportsman_module');

function getNumSportsmen(req, res){

}
function getSportsmen(req, res){
    var query = '';
    var conditions = common_sportsman_module._buildConditions_forGetSportsmen(req);
    if(req.query.branch != undefined)
        query = `Select user_Sportsman.id, firstname, lastname, photo from user_Sportsman join sportsman_category
            on user_Sportsman.id = sportsman_category.id`;
    else
        query = 'Select id, firstname, lastname, photo from user_Sportsman';
    query += conditions;
    query += common_sportsman_module._buildOrderBy_forGetSportsmen(req);
    console.log(query);

    DButilsAzure.execQuery( query)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((eror) => {
            res.status(400).send(eror)
        })
}

module.exports._getNumSportsmen = getNumSportsmen;
module.exports._getSportsmen = getSportsmen;
