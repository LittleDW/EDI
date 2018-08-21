/**
 * 作者：石奇峰
 * 模块：SQL连接池以及相关
 * 更新：2018-01-29，为了防止SQL注入，value的地方都要有转义 escape
 * */


var mysql = require('mysql'), config = require("../config/configure.json"), dbconfig, {promisify,co,logger} = require('./util'),
  sqls = require('../config/sqls.json'), BlueBird = require("bluebird").promisify;

dbconfig = config[process.env.NODE_ENV].db

let pool = mysql.createPool(Object.assign({}, dbconfig.read, {
  queryFormat: function (query, values) {
    if (!values) return query;

    var result = query.replace(/<(.+?)(:\?|:!)([\\.\w]+)?(')?\s*>/g, function (txt, any, matcher,key, quota) {
      if (values.hasOwnProperty(key)) {
        var value = values[key]
        if(matcher == ":?"){
          return (value || (typeof value == "number"))?` ${any}${value}${quota||""}`:"";
        } else {
          return (value || (typeof value == "number"))?` ${any}${this.escape(value)}${quota||""}`:"";
        }
      }
      return "";
    }.bind(this))
    /**
     * 对于所有以 and, not, or 或者逗号开始的条件(>, <, =, >=, <=, like, between, in)进行参数替换，如果参数无则清空该段片段, 目前暂时支持这些，如果又需要可以自行修改正则规则
     * 对于多个参数的条件来说，比如between和in，需要用::表示这是一个列表参数
     * */
    result = result.replace(/\s*?(and)?(or)?(not)?\s*?([\\.\w]+)\s*?(between)?(in)?\s*?::\?(\w+)\s*?(and)?(or)?/g, function (txt, and, or, not, name,between, inName, key, rearAnd, rearOr) {
      var safeGuard = ` ${and && rearAnd ||''}${or && rearOr||''} `
      if (values.hasOwnProperty(key)) {
        var value = values[key],self = this
        if(Array.isArray(value)){
          if(between){
            var condition = value.map(r=>self.escape(r)).join(" and ")
            return condition? ` ${and||''}${or||''}${not||''} ${name||''} ${between} ${condition} ${rearAnd||''}${rearOr||''} `:safeGuard
          } else if (inName){
            var condition = value.map(r=>r?self.escape(r):'').join(",")
            return condition? ` ${and||''}${or||''}${not||''} ${name||''} ${inName} (${condition}) ${rearAnd||''}${rearOr||''} `:safeGuard
          }
        }
      }
      return safeGuard;
    }.bind(this))

    result = result.replace(/\s*?(and)?(or)?(not)?(,)?\s*?([\\.\w]+)?\s*?([=/</>]+?)?(like)?\s*?:\?(\w+)\s*?(,)?(and)?(or)?/g, function (txt, and, or, not, comma, name, op, like, key, rearComma, rearAnd, rearOr) {
      var safeGuard = ` ${and && rearAnd ||''}${or && rearOr||''}${comma && rearComma||''} `
      if (values.hasOwnProperty(key)) {
        var value = values[key],self = this;
        if(like){
          if(value){
            var words = value.split(" ").map(r=>(`${name||''} ${like} ${self.escape(`%${r}%`)}`)).join(" and ")
            return ` ${and||''}${or||''}${not||''}${comma||''} ${words} ${rearComma||''}${rearAnd||''}${rearOr||''} `;
          } else {
            return safeGuard;
          }
        } else {
          return (value || (typeof value == "number")) ? ` ${and||''}${or||''}${not||''}${comma||''} ${name||''} ${op||''} ${this.escape(value)} ${rearComma||''}${rearAnd||''}${rearOr||''} ` : safeGuard;
        }
      }
      return safeGuard;
    }.bind(this))


    /**
     * 替换掉所有空的括号，where条件默认有1=1规则而可以不做替换
     * */
    result = result.replace(/\(\s+?\)/,"")
    return result
  }
}));

let writePool = mysql.createPool(Object.assign({}, dbconfig.write, {
  queryFormat: function (query, values) {
    if (!values) return query;

    var result = query.replace(/<(.+?)(:\?|:!)([\\.\w]+)?(')?\s*>/g, function (txt, any, matcher,key, quota) {
      if (values.hasOwnProperty(key)) {
        var value = values[key]
        if(matcher == ":?"){
          return (value || (typeof value == "number"))?` ${any}${value}${quota||""}`:"";
        } else {
          return (value || (typeof value == "number"))?` ${any}${this.escape(value)}${quota||""}`:"";
        }
      }
      return "";
    }.bind(this))

    result = result.replace(/\s*?(and)?(or)?(not)?\s*?([\\.\w]+)\s*?(between)?(in)?\s*?::\?(\w+)\s*?(and)?(or)?/g, function (txt, and, or, not, name,between, inName, key, rearAnd, rearOr) {
      var safeGuard = ` ${and && rearAnd ||''}${or && rearOr||''} `
      if (values.hasOwnProperty(key)) {
        var value = values[key],self = this;
        if(Array.isArray(value)){
          if(between){
            var condition = value.map(r=>self.escape(r)).join(" and ")
            return condition? ` ${and||''}${or||''}${not||''} ${name||''} ${between} ${condition} ${rearAnd||''}${rearOr||''}`:safeGuard
          } else if (inName){
            var condition = value.map(r=>self.escape(r)).join(",")
            return condition? ` ${and||''}${or||''}${not||''} ${name||''} ${inName} (${condition}) ${rearAnd||''}${rearOr||''}`:safeGuard
          }
        }
      }
      return safeGuard;
    }.bind(this))

    result = result.replace(/\s*?(and)?(or)?(not)?(,)?\s*?([\\.\w]+)?\s*?([=/</>]+?)?(like)?\s*?:\?(\w+)\s*?(,)?(and)?(or)?/g, function (txt, and, or, not, comma, name, op, like, key, rearComma, rearAnd, rearOr) {
      var safeGuard = ` ${and && rearAnd ||''}${or && rearOr||''}${comma && rearComma||''} `
      if (values.hasOwnProperty(key)) {
        var value = values[key],self = this;
        if(like){
          if(value){
            var words = value.split(" ").map(r=>(`${name||''} ${like} ${self.escape(`%${r}%`)}`)).join(" and ")
            return ` ${and||''}${or||''}${not||''}${comma||''} ${words} ${rearComma||''}${rearAnd||''}${rearOr||''} `;
          } else {
            return safeGuard;
          }
        } else {
          return (value || (typeof value == "number")) ? ` ${and||''}${or||''}${not||''}${comma||''} ${name||''} ${op||''} ${this.escape(value)} ${rearComma||''}${rearAnd||''}${rearOr||''} ` : safeGuard;
        }
      }
      return safeGuard;
    }.bind(this))

    result = result.replace(/\s*?(and)?(or)?(not)?(,)?\s*?([\\.\w]+)?\s*?([=/</>]+?)?(like)?\s*?:!(\w+)\s*?(,)?(and)?(or)?/g, function (txt, and, or, not, comma, name, op, like, key,rearComma, rearAnd, rearOr) {
      var safeGuard = ` ${and && rearAnd ||''}${or && rearOr||''}${comma && rearComma||''} `
      if (values.hasOwnProperty(key)) {
        var value = values[key],self = this;
        if(like){
          if(value){
            var words = value.split(" ").map(r=>(`${name||''} ${like} ${self.escape(`%${r}%`)}`)).join(" and ")
            return ` ${and||''}${or||''}${not||''}${comma||''} ${words} ${rearComma||''}${rearAnd||''}${rearOr||''} `;
          } else {
            return safeGuard;
          }
        } else if (typeof value == "number"){
          return ` ${and||''}${or||''}${not||''}${comma||''} ${name||''} ${op||''} ${this.escape(value)} ${rearComma||''}${rearAnd||''}${rearOr||''} `;
        } else {
          return ` ${and||''}${or||''}${not||''}${comma||''} ${name||''} ${op||''} ${this.escape(value||'')} ${rearComma||''}${rearAnd||''}${rearOr||''} `;
        }
      }
      return safeGuard;
    }.bind(this))

    result = result.replace(/\(\s+?\)/,"")
    return result
  }
}));

let getPrimeConnectionQ = (pool, type)=>{
    return (req)=>promisify(pool.getConnection).bind(pool)().then((connection={})=>{
      if(connection.config && !connection.config._queryFormatExtended){
        var originalFormat = connection.config.queryFormat
        connection.config.queryFormat = function(){
          var result = originalFormat.apply(connection, arguments)
          if(req){
            if (req.session.profile) {
              logger.info(`
            用户: ${req.session.profile.user_account}，执行${type}类SQL，
            子用户: ${req.session.profile.sub_account && req.session.profile.sub_account.user_account || ''},  
            sessionID: ${req.sessionID},
            IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress},  
            SQL: ${result}`);
            } else {
              logger.info(`
            用户: 匿名，执行查询类SQL，
            sessionID: ${req.sessionID},
            IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress},
            SQL: ${result}`);
            }
          } else {
            logger.info(`
            用户: 匿名，执行查询类SQL，
            sessionID: 无记录,
            IP: 无记录,
            SQL: ${result}`);
          }
          return result
        }
        connection.config._queryFormatExtended = true
      }
      return connection
    })
  },getConnectionQ = getPrimeConnectionQ(pool,"查询"),
  getWriteConnectionQ = getPrimeConnectionQ(writePool,"修改"),
  connectionRunner = (sql, param, req)=> {
    let connection
    return co(function*(){
      connection = yield getConnectionQ(req)
      var Query = promisify(connection.query, {multiArgs: true}).bind(connection);
      return yield Query(sql, param)
    }).catch((e)=>{
      logger.error(e.stack)
      return []
    }).then((data)=>{
      if(connection){
        connection.release();
      }
      return data
    })
  },
  writeConnectionRunner = (sql, param, req)=> {
    let connection
    return co(function*(){
      connection = yield getWriteConnectionQ(req)
      let Query = promisify(connection.query, {multiArgs: true}).bind(connection);
      return yield Query(sql, param)
    }).catch((e)=>{
      logger.error(e.stack)
      return []
    }).then((data)=>{
      if(connection){
        connection.release();
      }
      return data
    })
  };

// 在传入连接的情况下连接不会自动清除
let writeOperLog = (myconnection, params) => {
  let connection
  return co(function*(){
    if(!myconnection){
      connection = yield getWriteConnectionQ(req)
    } else {
      connection = myconnection
    }
    let Query = promisify(connection.query),
      Commit = promisify(connection.commit)
    yield Query.call(connection, sqls.operLogUpdate, params)
    return yield Commit.call(connection)
  }).catch((e)=>{
    logger.error(e.stack)
  }).then(()=>{
    if(connection && !myconnection){
      connection.release();
    }
  })
},  writeOperTableLog = (myconnection, params) => {
  let connection
  return co(function*(){
    if(!myconnection){
      connection = yield getWriteConnectionQ(req)
    } else {
      connection = myconnection
    }
    let Query = promisify(connection.query),
      Commit = promisify(connection.commit)
    yield Query.call(connection, sqls.operTableLogUpdate, params)
    return yield Commit.call(connection)
  }).catch((e)=>{
    logger.error(e.stack)
  }).then(()=>{
    if(connection && !myconnection){
      connection.release();
    }
  })
}

let formatMaxFee = (value) => {
  let val = Math.round(value*100)/100;
  val = (""+val).indexOf(".")>-1 ? val + "00" : val + ".00";
  let dec = val.indexOf(".");
  val = dec == val.length-3 || dec == 0 ? val.split(".") : val.substring(0,dec+3).split(".");
  val[0] = val[0].split("").reverse().join("");
  val[0] = val[0].replace(/(\d{3})/g,"$1,");
  val[0] = val[0].split("").reverse().join("");
  val[0] = val[0].indexOf(",")==0?val[0].substring(1):val[0];
  return val.join('.')
}

module.exports = {
  pool,
  writePool,
  writeOperLog,
  writeOperTableLog,
  getConnectionQ,
  getWriteConnectionQ,
  formatMaxFee,
  connectionRunner,
  writeConnectionRunner
}
