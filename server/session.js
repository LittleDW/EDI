/**
 * 作者：石奇峰
 * 功能：提供Edi couchbase 连接中间件
 * */


var session = require('express-session'),
    mysqlSession = require('express-mysql-session'),
    pool = require('./pool').pool, mysql = require('mysql'),
    config = require("../config/configure.json")[process.env.NODE_ENV],
    {db:dbconfig, domain} = config, promisify = require("bluebird").promisify

let MySQLStore = mysqlSession(session), sessionOption = {
    secret: "shiqifeng2000@gmail.com",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 7200000,
      domain: domain && `.${domain}` || undefined
    },
    rolling: true,
    name: `connect.edi.${process.env.NODE_ENV}`,
    createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist.
    connectionLimit: 10,// Number of connections when creating a connection pool
}

// 不能用连接池方式连接mysql作为session库
/*
var connection = mysql.createConnection(dbconfig.session);

var mysqlStore = new MySQLStore({
    createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist.
    connectionLimit: 10,// Number of connections when creating a connection pool
}, connection);
*/


var sessionStore = new MySQLStore(dbconfig.session);
// sessionOption.store = sessionStore

//module.exports.session = session(sessionOption)
module.exports = {
  session:session(sessionOption),
  killSession: ()=>{sessionStore.close();},
  sessionSaver: (session)=>promisify(session.save, {multiArgs: true}).bind(session)(),
  sessionReloader: (session)=>promisify(session.reload, {multiArgs: true}).bind(session)(),
}
//sessionSaver: (session)=>promisify(session.save, {multiArgs: true}).bind(session),
//  sessionReloader:promisify(req.session.reload, {multiArgs: true}).bind(req.session);
//yield sessionSaver()
//yield sessionReloader()
