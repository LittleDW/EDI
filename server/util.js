/**
 * Created by robin on 3/22/16.
 */
/**
 * 作者：石奇峰
 * 提供了各种库，库的实例，工具，方法等等
 */
require("./etc")

let decamelizeKeys = require('humps').decamelizeKeys, log4js = require('log4js'), co = require("co"),
  BlueBird = require("bluebird"), {spawn} = require('child_process'), path = require("path"),
  uuidv4 = require("uuid/v4"), fs = require("fs"),
  configure = require('../config/configure.json')[process.env.NODE_ENV], Bluebird = require("bluebird"),
  OSS = require('ali-oss'),
  XLSX = require("xlsx"), moment = require("moment"), BusBoy = require("busboy"),
  express = require('express'), Router = express.Router, multer = require('multer'), storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `${__dirname}/../temp`)
    },
    filename: (req, file, cb) => {
      cb(null, uuidv4() + path.extname(file.originalname))
    }
  }),
  upload = multer({
    storage: storage, limits: {
      fieldSize: "1024mb"
    }
  }), nodemailer = require("nodemailer");

log4js.configure({
  appenders: {
    server: {type: 'multiFile', base: path.resolve(`${__dirname}/../logs/`), property: 'date', extension: '.log'},
    error: {type: 'multiFile', base: path.resolve(`${__dirname}/../logs/error`), property: 'date', extension: '.log'},
    build: {type: 'multiFile', base: path.resolve(`${__dirname}/../logs/build`), property: 'date', extension: '.log'},
    visitor: {
      type: 'multiFile',
      base: path.resolve(`${__dirname}/../logs/visitor`),
      property: 'date',
      extension: '.log'
    },
  },
  categories: {
    default: {appenders: ['server'], level: 'debug'},
    error: {appenders: ['error'], level: 'error'},
    build: {appenders: ['build'], level: 'debug'},
    visitor: {appenders: ['visitor'], level: 'debug'}
  },
  pm2: true
});

const logger = log4js.getLogger();
const errorLogger = log4js.getLogger("error");
const buildLogger = log4js.getLogger("build");
const apiLogger = log4js.getLogger("visitor");

let tools = {
  getBrowserType: (userAgent) => {
    let is_chrome = userAgent.indexOf('Chrome') > -1
    const is_explorer = userAgent.indexOf('MSIE') > -1
    const is_firefox = userAgent.indexOf('Firefox') > -1
    let is_safari = userAgent.indexOf('Safari') > -1
    const is_opera = userAgent.toLowerCase().indexOf('op') > -1
    if ((is_chrome) && (is_safari)) {
      is_safari = false
    }
    if ((is_chrome) && (is_opera)) {
      is_chrome = false
    }

    if (is_explorer) {
      return 'MSIE'
    } else if (is_firefox) {
      return 'Firefox'
    } else if (is_opera) {
      return 'op'
    } else if (is_safari) {
      return 'Safari'
    } else if (is_chrome) {
      return 'Chrome'
    }

    return null
  },
  getMySQLFieldValue: (params) => decamelizeKeys(params, {separator: "_"}),
  logger: {
    info: (info, session) => {
      logger.addContext('date', new Date().format("yyyy-MM-dd_HH"));
      if (session && session.profile) {
        logger.info(`${session.profile.user_id}-${session.profile.user_name}-${info}`)
      } else {
        logger.info(info)
      }
    },
    error: (info, session) => {
      errorLogger.addContext('date', new Date().format("yyyy-MM-dd_HH"));
      if (session && session.profile) {
        errorLogger.error(`${session.profile.user_id}-${session.profile.user_name}-${info}`)
      } else {
        errorLogger.error(info)
      }
    },
    build: (info) => {
      buildLogger.addContext('date', new Date().format("yyyy-MM-dd_HH"));
      buildLogger.info(info)
    },
    visitor: (info) => {
      apiLogger.addContext('date', new Date().format("yyyy-MM-dd_HH"));
      apiLogger.info(info)
    },
    shutdown: log4js.shutdown
  },
  errorLogger,
  propertyChangeLogger(oldObj, keys, newObj, strict = false) {
    let result = [], obj = Object.assign({}, oldObj);
    keys.forEach(key => {
      let name, label
      if (key.name) {
        name = key.name
        label = key.label
      } else {
        name = key
        label = key
      }
      let logger = {value: obj[name]}
      Object.defineProperty(obj, name, {
        set: function (newValue) {
          if (strict || (newValue || (typeof newValue == "number") && (newValue == 0)) && (logger.value != newValue)) {
            logger.log = `${label} 由 ${(logger.value!=undefined && logger.value!=null)?logger.value:'空'} 变为 ${(newValue!=undefined && newValue!=null)?newValue:'空'} `;
            logger.value = newValue
          }
        }
      })
      result.push(logger)
    })
    Object.assign(obj, newObj)
    return result
  },
  spawning: (...params) => {
    const options = {stdio: ['pipe', 'pipe', 'pipe', 'ipc']}
    return new Promise((res, rej) => {
      let child = spawn("node", params, options)
      child.on('message', (message) => {
        if (message.success) {
          res(message.file)
        } else {
          rej(message)
        }
      });
      child.on('error', (message) => {
        rej(message)
      });
    })
  },
  thunkifyEvent: ({emitter, on = "on", event, count, sync = false, gen, err}) => {
    let results = [], listener
    /** 假如制定了count，则监听count次*/
    if ((typeof count == "number") && count > 0) {
      let qList = []
      for (var i = 0; i < count; i++) {
        results.push(new Promise((res, rej) => {
          qList.push({res, rej})
        }))
      }
      listener = function () {
        if (qList.length > 0) {
          let [{res, rej}] = qList.splice(0, 1)
          res(co.apply(null, [gen, ...arguments]).catch((e) => {
            if (typeof err == "function") {
              return err(e)
            } else {
              rej(e)
            }
          }))
        }
      }
    } else {
      /** 假如没有制定了count，则监听时增加promise，使用者需要自己判断何时collect结果*/
      listener = function () {
        results.push(co.apply(null, [gen, ...arguments]).catch((e) => {
          if (typeof err == "function") {
            return err(e)
          } else {
            return Promise.reject(e)
          }
        }))
      }
    }
    emitter[on](event, listener)
    return {
      collect: co.wrap(function* () {
        if (sync) {
          let finalResults = []
          while (results.length) {
            finalResults.push(yield results.pop())
          }
          return finalResults
        } else {
          return yield results
        }
      }),
      listener
    }
  },
  promisifyInterval: (thunkList, timer) => {
    let result = []
    let interval = setInterval(() => {
      let thunk = thunkList.splice(0, 1)[0];
      (typeof thunk == "function") && result.push(thunk())
    }, timer)
    return () => {
      clearInterval(interval)
      return Promise.all(result)
    }
  },
  promisifyTimeout: (timer) => {
    return new Promise((res, rej) => {
      setTimeout(res, timer)
    })
  },
  promisifyPipingTempFile: (file) => {
    if (file._readableState.flowing !== false) {
      return new Promise((res, rej) => {
        let tempPath = path.resolve(`${__dirname}/../temp/${uuidv4()}${Date.now()}`),
          tempWriteStream = fs.createWriteStream(tempPath);
        tempWriteStream.on("error", (e) => {
          rej(e)
          if (fs.existsSync(tempPath)) {
            fs.unlink(tempPath)
          }
        })
        tempWriteStream.on("finish", () => {
          res()
          if (fs.existsSync(tempPath)) {
            fs.unlink(tempPath)
          }
        })
        file.pipe(tempWriteStream);
      })
    } else {
      return Promise.resolve()
    }
  },
  removefileIfExist: (filename) => {
    if (filename) {
      // let stat = fs.statSync(filename)
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename)
      }
    }
  },
  nextTick: BlueBird.promisify(process.nextTick),
  getSurvivingDays: () => Math.floor((Date.now() - configure.beginSince) / (3600000 * 24)),
  makeTree: (menusRows) => {
    let menus = new Array();
    let menuMap = new Map();
    for (let row of menusRows) {
      let funcId = row.func_id;
      let funcName = row.func_name;
      let fFuncId = row.f_func_id;
      let funcPath = row.func_path != null ? `(${row.func_path})` : "";
      let leaf = new Object();
      leaf.value = funcId;
      leaf.label = row.func_level == 0 ? `${funcName}${funcPath}` : funcName;
      leaf.children = []
      menuMap.set(funcId, leaf);
      if (fFuncId != null && fFuncId != undefined && fFuncId.length > 0) {
        let fNode = menuMap.get(fFuncId)
        fNode.children.push(leaf);
      } else {
        menus.push(leaf);
      }
    }
    return menus;
  },
  getSheetValue: (r) => (typeof r == "string") ? r.trim() : r,
  /*getSheetDateValue: (value) => {
    let result
    try {
      let date = moment(value,["YYYY-MM-DD","MM-DD-YYYY","MM/DD/YY","MM/DD/YYYY"])
      if(date.isValid()){
        result = date.format("YYYY-MM-DD")
      }
      /!*if (date && !isNaN(date.getTime())) {
        result = date.format("yyyy-MM-dd")
      }*!/
    } catch (e) {
    }
    return result
  },
  getSheetMonthValue: (value) => {
    let result
    try {
      let date = moment(value,["YYYY-MM-DD","MM-DD-YYYY", "YYYY-MM", "MM-YYYY"])
      if(date.isValid()){
        result = date.format("YYYY-MM")
      }
      /!*if (date && !isNaN(date.getTime())) {
        result = date.format("yyyy-MM")
      }*!/
    } catch (e) {
    }
    return result
  },*/
  getSheetDateValue: (value) => {
    let result
    try {
      let date = new Date(value)
      if (date && !isNaN(date.getTime())) {
        result = date.format("yyyy-MM-dd")
      }
    } catch (e) {
    }
    return result
  },
  getSheetMonthValue: (value) => {
    let result
    try {
      let date = new Date(value)
      if (date && !isNaN(date.getTime())) {
        result = date.format("yyyy-MM")
      }
    } catch (e) {
    }
    return result
  },
  getSheetNumberValue: (value) => {
    if (!isNaN(value)) {
      return Number(value)
    } else if (typeof value == "string") {
      var formatted = value.replace(",", "");
      if (isNaN(formatted)) {
        return NaN
      } else {
        return Number(formatted)
      }
    } else {
      return NaN
    }
  },
  getSheetPercentValue: (value) => {
    if (!isNaN(value)) {
      return Number(value)
    } else if (typeof value == "string") {
      var formatted = value.replace(/%$/, "") *100/ 10000;
      if (isNaN(formatted)) {
        return NaN
      } else {
        return Number(formatted)
      }
    } else {
      return NaN
    }
  },
  getSheetSuffixValue: (array) => {
    return (value) => {
      if (!isNaN(value)) {
        return Number(value)
      } else if (typeof value == "string") {
        var formatted = value.trim().replace(new RegExp(`${array.join("|")}$`), "").trim()
        if (isNaN(formatted)) {
          return NaN
        } else {
          return Number(formatted)
        }
      } else {
        return NaN
      }
    }
  },
  pipeToTempFile: (value) => {
    let tempFile = path.resolve(`${__dirname}/../temp/${uuidv4()}`), fd = fs.openSync(tempFile, 'w+')
    fs.writeFileSync(fd, value)
    return tempFile
  },
  appendUUID: (filename) => {
    let extname = path.extname(filename)
    return `${path.basename(filename, extname)}-${uuidv4()}${extname}`
  },
  connectToSocketHub: (sessionID,pid) => {
    var io = require('socket.io-client')('ws://127.0.0.1:6180/edi-message-broker',{transports: ['websocket'],transportOptions: {
        websocket: {
          extraHeaders: {
            'x-edi-session': sessionID,
            'x-edi-pid': pid
          }
        }
      }});
    return new Promise((res,rej)=>{
      io.on('connect', ()=>res(io));
      io.on('connect_error', rej);
      io.on('connect_timeout', rej);
    })
  },
  pushMessage: (socket, opt) => {
    socket.emit("message", opt)
  },
  userDiffer: (user_type, [admin, fund, asset]) => (((user_type == 3) || (user_type == 4)) && admin) || (user_type == 2) && fund || (user_type == 1) && asset || "unknown",
  Router,
  oss: new OSS(configure.oss.opt),
  upload,
  path,
  BlueBird,
  promisify: BlueBird.promisify,
  fs,
  uuidv4,
  XLSX,
  configure,
  co,
  moment,
  BusBoy,
  hasDuplicate:(array)=>((new Set(array)).size !== array.length),
  validate: (obj, property, regex, message)=>{
    if(typeof obj != "object"){
      return "验证主体必须为object"
    } else if (!obj.hasOwnProperty(property)){
      return `字段 ${property} 缺失`
    } else if(regex){
      var value = obj[property]
      if(!new RegExp(regex).test(value)){
        return message
      }
    }
  },
  sendMail: (mailOptions) => {
    let result = {success: true}
    let transporter = nodemailer.createTransport({
      host: configure.mail.smtp.host,
      port: configure.mail.smtp.port,
      secure: configure.mail.smtp.secure,
      auth: {
        user: configure.mail.smtp.user,
        pass: configure.mail.smtp.password
      }
    })

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        result = {success: false, message: error}
      }
    });

    return result
  },
  formatNumber: (number) => {
    if (isNaN(number)) {
      return '-'
    } else {
      let value = ''
      let numArr = String(number).split('.')
      let num = numArr[0] < 0 ? numArr[0] * -1 : numArr[0]
      value = String(num).split("").reverse().join("");
      value = value.replace(/(\d{3})/g,"$1,");
      value = value.split("").reverse().join("");
      value = value.indexOf(",")==0?value.substring(1):value;
      let result =  number < 0 ? '-' + value : value
      if (numArr.length > 1) {
        result = result +  '.' + numArr[1]
      }
      return result
    }
  },
  generateCaptcha: () => {
    let cap = ''
    for (let i = 0; i < 6; i++) {
      cap += String(Math.floor(Math.random() * 9))
    }
    return cap
  },
  operLogDictionaryGenerator: (tableName = '', variableNames = [], params = {}) => {
    const _  = require('lodash');
    const enhancedParams = _.clone(params);
    const dictionary = [
      {t: '*', v: 'is_check_stock',key: 0, val: '关'},
      {t: '*', v: 'is_check_stock', key: 1, val: '开'},
      // user
      {t: '*', v: 'user_type', key: 1, val: '资产方'},
      {t: '*', v: 'user_type', key: 2, val: '资金方'},
      {t: '*', v: 'user_type', key: 3, val: '资产管理员'},
      {t: '*', v: 'user_type', key: 4, val: '系统管理员'},
      {t: '*', v: 'user_type', key: 5, val: '外部资产方'},
      {t: '*', v: 'user_type', key: 6, val: '外部资金方'},
      {t: '*', v: 'user_from', key: '1', val: '系统内用户'},
      {t: '*', v: 'user_from', key: '2', val: '系统外用户'},
      {t: '*', v: 'user_status', key: 0, val: '未审核'},
      {t: '*', v: 'user_status', key: 1, val: '已审核'},
      // Api
      {t: '*', v: 'api_type', key: '01', val: '资金方接收个人借款单'},
      {t: '*', v: 'api_type', key: '02', val: '资金方接收企业授信申请'},
      {t: '*', v: 'api_type', key: '03', val: '资金方接收企业借款单'},
      {t: '*', v: 'api_type', key: '04', val: '资金方提供给资产方用于开户、提现、还款和受托支付授权等操作入口'},
      {t: '*', v: 'api_type', key: '22', val: '资金方接收状态变化通知'},
      {t: '*', v: 'api_type', key: '23', val: '资金方接收订单凭证变化通知'},
      {t: '*', v: 'api_type', key: '24', val: '资金方接收企业授信凭证变化通知'},
      {t: '*', v: 'api_type', key: '26', val: '资金方借款人开户信息查询'},
      {t: '*', v: 'api_type', key: '21', val: '资产方接收状态变化通知'},
      {t: '*', v: 'api_type', key: '25', val: '资产方接收合同更新补充通知'},
      // task
      {t: '*', v: 'task_status', key: '1', val: '已创建'},
      {t: '*', v: 'task_status', key: '2', val: '处理中'},
      {t: '*', v: 'task_status', key: '3', val: '已完成'},
      // platform
      {t: 't_user_attribute', v: 'platform_pay_mode', key: '001', val: '预缴'},
      {t: 't_user_attribute', v: 'platform_pay_mode', key: '002', val: '月结'},
      // repayment
      {t: 't_repayment', v: 'repayment_status', key: '00', val: '创建'},
      {t: 't_repayment', v: 'repayment_status', key: '01', val: '资产方确认'},
      {t: 't_repayment', v: 'repayment_status', key: '02', val: '资产方还款'},
      {t: 't_repayment', v: 'repayment_status', key: '03', val: '资金方确认'},
      // role
      {t: 't_role', v: 'role_type', key: 1, val: '资产方'},
      {t: 't_role', v: 'role_type', key: 2, val: '资金方'},
      {t: 't_role', v: 'role_type', key: 3, val: '资产管理员'},
      {t: 't_role', v: 'role_type', key: 4, val: '系统管理员'},
      // asset fund
      {t: 't_asset_fund', v: 'interest_mode', key: '001', val: '到账起息'},
      {t: 't_asset_fund', v: 'interest_mode', key: '002', val: '满标起息'},
      {t: 't_asset_fund', v: 'service_mode', key: '001', val: '出账次月结算'},
      {t: 't_asset_fund', v: 'service_mode', key: '002', val: '付息时结算'},
      {t: 't_asset_fund', v: 'service_mode', key: '003', val: '付息次月结算'},
      {t: 't_asset_fund', v: 'service_mode', key: '004', val: '还本时结算'},
      {t: 't_asset_fund', v: 'service_mode', key: '005', val: '还本次月结算'},
      {t: 't_asset_fund', v: 'service_mode', key: '006', val: '其它'},
      // user attribute
      {t: 't_user_attribute', v: 'partner_nature', key: '001', val: '网贷平台'},
      {t: 't_user_attribute', v: 'partner_nature', key: '002', val: '银行'},
      {t: 't_user_attribute', v: 'partner_nature', key: '003', val: '信托'},
      {t: 't_user_attribute', v: 'partner_nature', key: '100', val: '其它'},
      {t: 't_user_attribute', v: 'is_debt_exchange', key: 0, val: '不支持'},
      {t: 't_user_attribute', v: 'is_debt_exchange', key: 1, val: '支持'},
      {t: 't_user_attribute', v: 'is_deadline_favor', key: 0, val: '无'},
      {t: 't_user_attribute', v: 'is_deadline_favor', key: 1, val: '有'},
    ];

    _.map(variableNames, variableName => {
      let variable = enhancedParams[variableName];
      if(!_.isNumber(variable) && _.isEmpty(variable)){
        return ;
      }
      const result = _.find(dictionary, (d) => {
        return d.t === tableName && d.v === variableName && (d.key === variable || _.toString(d.key) === _.toString(variable));
      });
      if(!_.isEmpty(result)){
        enhancedParams[variableName] = result.val;
      }
    });
    return enhancedParams;
  },
  operLogDictionaryGeneratorWithSplit: (tableName = '', variableNames = [], params = {}) => {
    const _  = require('lodash');
    const enhancedParams = _.clone(params);
    const dictionary = [
      {t: 't_user_attribute', v: 'repayment_mode', key: '001', val: '到期还本付息'},
      {t: 't_user_attribute', v: 'repayment_mode', key: '002', val: '按月付息到期还本'},
      {t: 't_user_attribute', v: 'repayment_mode', key: '003', val: '按月等额本息'},
      {t: 't_user_attribute', v: 'repayment_mode', key: '004', val: '按月等额本金'},
      {t: 't_user_attribute', v: 'repayment_mode', key: '005', val: '按周付息到期还本'},
      {t: 't_user_attribute', v: 'repayment_mode', key: '006', val: '按周等额本息'},
      {t: 't_user_attribute', v: 'repayment_mode', key: '007', val: '按周等额本金'},
      {t: 't_user_attribute', v: 'repayment_mode', key: '008', val: '其它'},
      {t: 't_user_attribute', v: 'product_deadline', key: '000', val: '0-15天(含)'},
      {t: 't_user_attribute', v: 'product_deadline', key: '001', val: '16-31天(含)'},
      {t: 't_user_attribute', v: 'product_deadline', key: '002', val: '32-62天(含)'},
      {t: 't_user_attribute', v: 'product_deadline', key: '003', val: '63-92天(含)'},
      {t: 't_user_attribute', v: 'product_deadline', key: '004', val: '93-183天(含)'},
      {t: 't_user_attribute', v: 'product_deadline', key: '005', val: '184-365天(含)'},
      {t: 't_user_attribute', v: 'product_deadline', key: '006', val: '366-730天(含)'},
      {t: 't_user_attribute', v: 'product_deadline', key: '007', val: '＞730天'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '100', val: '待处理'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '105', val: '待审核'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '110', val: '匹配成功'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '120', val: '开户成功'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '130', val: '垫资完毕'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '140', val: '审核完毕'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '150', val: '上标完毕'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '160', val: '满标完毕'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '170', val: '出账完毕'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '180', val: '资金到账'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '190', val: '还款完毕'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '910', val: '匹配失败'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '920', val: '垫资失败'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '930', val: '审核未通过'},
      {t: 't_user_attribute', v: 'platform_pay_scope', key: '940', val: '募集失败'},
    ];
    _.map(variableNames, variableName => {
      let variable = enhancedParams[variableName];
      if(_.isEmpty(variable)){
        return ;
      }
      enhancedParams[variableName] = _.map(_.split(variable, ','), (s) => {
        const result = _.find(dictionary, (d) => {
          return d.t === tableName && d.v === variableName && (d.key === s || _.toString(d.key) === _.toString(s));
        });
        if(!_.isEmpty(result)){
          s = result.val;
        }
        return s;
      }).join(';');
    });
    return enhancedParams;
  },
  asynclize:(fn, isGet) => (req, res, next) => {
    const fnReturn = fn(req, res, next)
    return Promise.resolve(fnReturn).catch(e=>{
      logger.error(e);
      if(isGet){
        res.status(404).send(e.message)
      } else {
        res.json({success: false, message: e.message})
      }
    });
  }
}

tools.killSubProcess = (value, process) => {
  process.send && (typeof process.send == "function") && process.send({
    success: true,
    file: tools.pipeToTempFile(value)
  });

  setTimeout(function () {
    process.exit()
  }, 200)
}


module.exports = tools
