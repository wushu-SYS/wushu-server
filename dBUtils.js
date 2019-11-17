dbUtils = require('tedious-promises');
var dbConfig = require('./config');
tediousTYPES = require('tedious').TYPES;
var ConnectionPool = require('tedious-connection-pool');
var poolConfig = {
    min: 3,
    max: 20,
    log: true}; // see tedious-connection-pool documentation
var pool = new ConnectionPool(poolConfig, dbConfig);
dbUtils.setConnectionPool(pool);
var _ = require('lodash');
dbUtils.setDefaultColumnRenamer(_.camelCase);

















