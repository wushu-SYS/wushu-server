dbUtils = require('tedious-promises');
let dbConfig = require('./config');
tediousTYPES = require('tedious').TYPES;
let ConnectionPool = require('tedious-connection-pool');
let poolConfig = {
    min: 3,
    max: 20,
    log: true}; // see tedious-connection-pool documentation
let pool = new ConnectionPool(poolConfig, dbConfig);
dbUtils.setConnectionPool(pool);
let _ = require('lodash');
dbUtils.setDefaultColumnRenamer(_.camelCase);

















