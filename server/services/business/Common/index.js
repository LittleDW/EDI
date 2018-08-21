/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-03-28 14-19
 */
const _ = require('lodash');
const svgCaptcha = require('svg-captcha')
const uaParser = require('ua-parser-js');
const moment = require('moment');
const fs = require('fs')
const path = require('path')

const Dao = require('./commonDao');
const configure = require('../../../../config/configure')[process.env.NODE_ENV];
const {getMySQLFieldValue, BusBoy, spawning, removefileIfExist, uuidv4, logger} = require('../../../util');

const getDictionary = async ({user_type, org_code, user_id, sub_account} = {}, req) => {
  let sub_user_id = sub_account && sub_account.sub_user_id || "",
    is_data_func = sub_account && sub_account.is_data_func || 0,
    asset_org_code = (user_type == 1) && org_code || "", fund_org_code = (user_type == 2) && org_code || "",
    relatedOrgsPromise, assetAccountPromise, fundAccountPromise;
  const dao = Dao(req);
  switch (user_type) {
    case 1:
    case 2:
      relatedOrgsPromise = dao.relatedOrgs(getMySQLFieldValue({org_code}))
      assetAccountPromise = dao.getAssetAccount(getMySQLFieldValue({asset_org_code, fund_org_code}))
      fundAccountPromise = dao.getFundAccount(getMySQLFieldValue({asset_org_code, fund_org_code,}))
      break;
    case 3:
    case 4:
      relatedOrgsPromise = dao.relatedOrgs()
      assetAccountPromise = Promise.resolve([])
      fundAccountPromise = Promise.resolve([])
      break;
    default:
      relatedOrgsPromise = Promise.resolve([])
      assetAccountPromise = Promise.resolve([])
      fundAccountPromise = Promise.resolve([])
  }

  let [relatedOrgs, assetAccounts, fundAccounts, rows, plainMenuFuncs, deadlineList, dateRange, [nextWeek], dependencyRows, dataRestriction] = await Promise.all([
    relatedOrgsPromise,
    assetAccountPromise,
    fundAccountPromise,
    dao.dictionary(),
    sub_user_id ? dao.subuserMenu({sub_user_id}):dao.userMenu({user_id}),
    dao.deadline(),
    dao.getAllWeekAndDate(),
    dao.getNextWeek(),
    dao.checkUserInfoIntegrity({user_id}),
    sub_user_id? dao.dataRestriction({sub_user_id}) : Promise.resolve([])
  ])
  let button = plainMenuFuncs.filter(r => r.func_level == 2),
    submenu = plainMenuFuncs.filter(r => r.func_level == 1),
    menu = plainMenuFuncs.filter(r => r.func_level == 0)
  let tree = menu.map(r => Object.assign({
    children: submenu.filter(s => s.f_func_id == r.func_id)
      .map(t => Object.assign({
        children: button.filter(v => v.f_func_id == t.func_id)
          .map(y => ({id: y.page_id, func_id: y.func_id, name: y.func_name}))
      }, t))
      .map(y => ({id: y.page_id, name: y.func_name, children: y.children}))
  }, r))
    .map(y => ({id: y.page_id, name: y.func_name, children: y.children, iconClassName: y.func_img}));
  req.session._menu = [...new Set(menu.map(r => r.page_id))]
  req.session._submenu = [...new Set(submenu.map(r => r.page_id))]
  req.session._button = [...new Set(button.map(r => r.page_id))]

  // 检查用户信息完整性
  let dependencies = []
  if (Array.isArray(dependencyRows) && ((user_type == 1) || (user_type == 2))) {
    if (dependencyRows.length) {
      let {partner_nature} = dependencyRows[0]
      if ((typeof partner_nature !== "string") || !partner_nature.trim()) {
        dependencies.push({submenu: "user_attribute", hint: "您的用户平台属性还未完善，补完信息后才能操作哦！"})
      }
    } else {
      dependencies.push({submenu: "user_attribute", hint: "您的用户平台属性还未完善，补完信息后才能操作哦！"})
    }
  }

  let restriction = {};
  if(Array.isArray(dataRestriction) && sub_user_id && is_data_func){
    let assetDataRestriction = dataRestriction.filter(r=> (r.user_type === 1)).map(r=>r.partner_org_code),
      fundDataRestriction = dataRestriction.filter(r=> (r.user_type === 2)).map(r=>r.partner_org_code)
    switch (user_type) {
      case 1:
        relatedOrgs = relatedOrgs.filter(r=> (r.asset_org_code === org_code) && fundDataRestriction.includes(r.fund_org_code))
        if(!assetDataRestriction.includes(org_code)){
          assetDataRestriction.push(org_code)
        }
        break;
      case 2:
        relatedOrgs = relatedOrgs.filter(r=> (r.fund_org_code === org_code) && assetDataRestriction.includes(r.asset_org_code))
        if(!fundDataRestriction.includes(org_code)){
          fundDataRestriction.push(org_code)
        }
        break;
      case 3:
      case 4:
        relatedOrgs = relatedOrgs.filter(r=>
          (fundDataRestriction.includes(r.fund_org_code)) && (assetDataRestriction.includes(r.asset_org_code))
        )
        break;
      default:
        break;
    }
    assetAccounts = assetAccounts.filter(r=> assetDataRestriction.includes(r.asset_org_code) && fundDataRestriction.includes(r.fund_org_code));
    fundAccounts = fundAccounts.filter(r=> assetDataRestriction.includes(r.asset_org_code) && fundDataRestriction.includes(r.fund_org_code));

    restriction = {assetDataRestriction,fundDataRestriction}
    req.session.subUserDataRestriction = restriction
  } else {
    delete req.session.subUserDataRestriction
  }

  return {
    dictionary: rows, menu: tree, relatedOrgs, deadlineList,
    dateRange: dateRange.filter(item => item.week !== '00'), nextWeek, assetAccounts, fundAccounts,
    dependencies
  }
};

const login = async ({userAccount, password} = {}, req) => {
  const dao = Dao(req);
  let rows;
  if (userAccount && userAccount.includes(":")) {
    let userGroup = userAccount.split(":")
    let preCheckRows = await dao.login(getMySQLFieldValue({user_account: userGroup[0]}))
    if (!preCheckRows) {
      throw new Error("查无此主用户")
    }
    rows = await dao.subuserLogin(getMySQLFieldValue({
      user_id: preCheckRows.user_id,
      user_account: userGroup[1],
      password: password ? password.md5() : ''
    }))
    if (!rows) {
      throw new Error("校验失败")
    }
    rows = Object.assign({}, preCheckRows.dataValues, {sub_account: rows, sub_user_id: rows.sub_user_id})
    if (!rows) {
      throw new Error("校验失败")
    }
    return rows;
  } else {
    let preCheckRows = await dao.login(getMySQLFieldValue({user_account:userAccount}));
    if (!preCheckRows) {
      throw new Error("查无此用户")
    }
    rows = await dao.login(getMySQLFieldValue({
      userAccount,
      password: password ? password.md5() : ''
    }))
    if (!rows) {
      throw new Error("校验失败")
    }
    return rows.get()
  }


};

const loginLog = async ({user_id, sub_user_id} = {}, req) => {
  const dao = Dao(req);
  let userAgent = req.headers['user-agent'],
    xForwardFor = req.headers['x-forwarded-for'],
    ua = uaParser(userAgent),
    {os, browser} = ua;
  return await dao.createLoginLog(getMySQLFieldValue({
    user_id: user_id,
    login_type: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ? 1 : 0,
    login_ip: xForwardFor || req.connection.remoteAddress || null,
    login_proxy_ip: !xForwardFor ? null : req.connection.remoteAddress,
    login_host_name: req.hostname,
    login_mac_address: req.session.id,
    login_browser: browser ? `${browser.name},${browser.version}` : null,
    login_system: os ? `${os.name},${os.version}` : null,
    create_user_id: user_id,
    sub_user_id: sub_user_id,
  }))
};

const getCaptcha = async (req, res, next) => {
  var captcha = svgCaptcha.create({ignoreChars: '0o1i'}); // 验证码字符中排除 0o1i
  captcha.token = Date.now()
  return captcha
};

const createTableExportingLog = async ({from_table,action_type="导出",total,params}={from_table:"",action_type:"导出",total:0,params:""}, req) => {
  let from_org_code = req.session.profile.org_code,
    create_user_id = req.session.profile.user_id,
    sub_user_id = req.session.profile.sub_user_id
  const dao = Dao(req);
  return await dao.createTableExportingLog({
    from_table, from_org_code, create_user_id, sub_user_id, action_type, total, params
  })
};

const parsingStream = async (processor, req, options) => {
  let busboy = new BusBoy({headers: req.headers, limits: {fieldNameSize: 200, fieldSize: Infinity}, ...options})
  req.pipe(busboy);
  return await processor(busboy, req)
  //return req.pipe(busboy);
};
/*const loginLogCount = async (param, req) => {
  const dao = Dao(req);
  return await dao.loginLogCount(param)
};

const loginLogQuery = async (param,req) => {
  const dao = Dao(req);
  return await dao.loginLogQuery(param)
};

const financeOperLogQuery = async (param, req) => {
  const dao = Dao(req);
  return await dao.financeOperLogQuery(param)
};
*/
const operLogQuery = async (param, req) => {
  const dao = Dao(req);
  return await dao.operLogQuery(param)
};
const bridgeService = (obj, myDao)=>{
  return new Proxy(obj, {
    get: function(obj, name) {
      if(obj && _.isNil(obj[name])){
        return async (param, req)=> {
          let dao = (_.isNil(myDao)? Dao:myDao)(req), method = dao.bridge(name).bind(dao)
          return await method(param)
        }
      }
      return obj[name]
    }
  });
}

const spawningService = async (runner, param, files)=>{
  // let resultFile = await spawning("--inspect-brk=9231",runner, ...param),
  let resultFile = await spawning(runner, ...param),
    resultData = JSON.parse(fs.readFileSync(resultFile, {encoding: "utf8"}));
  if(Array.isArray(files)){
    files.forEach(r=>{
      fs.unlinkSync(r)
    })
  }
  fs.unlinkSync(resultFile)
  return resultData
}

const pagingSpawningService = async (runner, param, pages)=>{
  let qList = [], outputFile = path.resolve(`${__dirname}/../../../../temp/${uuidv4()}`),
    xslx = path.resolve(`${__dirname}/../../../../temp/${uuidv4()}`);
  fs.closeSync(fs.openSync(outputFile, 'w'));
  for (var i = 0; i < pages; i++) {
    qList.push(spawning(runner, ...param, i * configure.exportLimit, outputFile))
    // qList.push(spawning('--inspect-brk=9231', runner, ...param, i * configure.exportLimit, outputFile))
  }
  await Promise.all(qList)
  await spawning(path.resolve(`${__dirname}/../../../spawn/json2xslx.js`), outputFile, xslx);
  removefileIfExist(outputFile);
  return xslx
}

const simplyLogItService = async ({from_table,from_table_key,action_type="点击",params}={from_table:"",from_table_key:"",action_type:"点击",params:""}, req) => {
  let from_org_code = req.session.profile.org_code,
    create_user_id = req.session.profile.user_id,
    sub_user_id = req.session.profile.sub_user_id
  const dao = Dao(req);
  return await dao.simplyLogIt({
    from_table,
    from_table_key:`[${from_table_key}]`,
    from_org_code, create_user_id, sub_user_id, action_type, params
  }).catch((err) => {
    console.error(`log error: ${err}`);
    logger.error(`记录操作日志时发生错误，${err}`);
  });
};

const simplyLogTableService = async ({from_table,action_type="导出",total,params}={from_table:"",action_type:"导出",total:0,params:""}, req) => {
  let from_org_code = req.session.profile.org_code,
    create_user_id = req.session.profile.user_id,
    sub_user_id = req.session.profile.sub_user_id
  const dao = Dao(req);
  return await dao.simplyLogTable({
    from_table, from_org_code, create_user_id, sub_user_id, action_type, total, params
  })
};

module.exports = {
  service: bridgeService({
    getDictionary,
    login,
    loginLog,
    getCaptcha,
    createTableExportingLog,
    parsingStream,
    spawningService,
    pagingSpawningService,
    simplyLogItService,
    simplyLogTableService
  }),
  bridgeService
};
