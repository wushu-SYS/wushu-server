const {MySQL} = require("mysql-promisify");
const bcrypt = require('bcryptjs');
const constants = require('./constants')


//const connectionUrl = process.env.JAWSDB_URL
const connectionUrl = "mysql://msdtxxlhfavul98j:rrmnue40gi3k6drk@zpfp07ebhm2zgmrm.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/qvk6nuqemi5cc4pi"
const database = connectionUrl.split('/')[connectionUrl.split('/').length-1]
const host = (connectionUrl.split('@')[1]).split(':')[0]
const user = (connectionUrl.split(':')[1]).split('//')[1]
const pass = (connectionUrl.split(':')[2]).split('@')[0]

const dbConnection = new MySQL({
    host: host,
    user: user,
    password: pass,
    database: database,
    charset: "utf8",
    timeout: 60000,
    connectionLimit: 5,
});


async function a() {
    let ans = new Object()
    await dbConnection.query({
        sql: 'select * from table_name'
    })
        .then((res) => {
            console.log(res)
            ans.a = 200
        }).catch((err) => {
            console.log(err)
            ans.a = 400
        })
    console.log(ans)
}

async function b() {
    let ans = new Object()
    const tdb = await dbConnection.getTransactionDb();
    await tdb.query({sql: 'insert into table_name (a) values (78)'})
        .then((res) => {
        })
        .catch((err) => {
        })
    await tdb.query({sql: 'insert into table_name (a) values (d)'})
        .then(async (res) => {
            await tdb.commit()
        })
        .catch(async (err) => {
            await tdb.rollback()
        })

    console.log(ans)
}

function c() {
    dbConnection.parallelQueries(
        [{
            sql: `INSERT INTO user_Passwords (id,password,isfirstlogin)
                      select * from (select :idUser as id, :password as password ,:isFirstLogin as isfirstlogin)
                      as tmp where not exists( select id,password,isfirstlogin from user_Passwords where id= :idUser);`
            , params: {
                idUser: parseInt('123456789'),
                password: bcrypt.hashSync('123456789', constants.saltRounds),
                isFirstLogin: 1
            }
        }, {
            sql:
                `insert into user_UserTypes (id, usertype) values (:idUser , :userType);`,
            params: {
                idUser: parseInt('123456789'), userType: 3,
            }
        }])
        .then(() => {

        }).catch((err) => {
        console.log(err)
    })
}


module.exports.dbConnection = dbConnection
