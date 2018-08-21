var {getConnectionQ, getWriteConnectionQ,connectionRunner} = require('../pool'), path = require("path"),
  sqls = require("../../config/sqls.json"),
  uaParser = require('ua-parser-js'), cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'), {session, sessionSaver,sessionReloader} = require('../session'),
  configure = require('../../config/configure.json')[process.env.NODE_ENV],
  {logger, promisify, co, Router, getMySQLFieldValue, spawning, getSurvivingDays} = require("../util"),
  router = Router(), svgCaptcha = require('svg-captcha');;

/**
 * 作者：石奇峰
 * 功能：所有http请求的入口，用于解析cookie，提取session，记录访问，验证登录，登录日志，调用字典，登出等共通的接口
 * */

router.use(cookieParser('shiqifeng2000@gmail.com'))
router.use(bodyParser.json({limit: '50mb'}))
router.use(bodyParser.urlencoded({extended: true}));
router.use(session)

router.use((req, res, next) => {
  req.setTimeout(configure.safeTimeout);
  /*if (!req.cookies || !req.cookies._edi_session) {
    delete req.session.profile
  } else if (!req.session.profile) {
    res.cookie('_edi_session', '')
  }*/
  let suffix = `
      header信息:
${Object.keys(req.headers).map(r =>`  \t\t\t${r}:${JSON.stringify(req.headers[r])}`).join(",\n")},
      url信息: ${req.url},
      访问方式: ${req.method},
      session: ${req.sessionID},
      body信息：${JSON.stringify(req.body)}
  `
  try {
    if (req.session.profile) {
      logger.visitor(`
        用户: ${req.session.profile.user_account}，发来数据，
        子用户: ${req.session.profile.sub_account && req.session.profile.sub_account.user_account || ''},
        ${suffix}`);
    } else {
      logger.visitor(`
        用户: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.sessionID}，发来数据，
        ${suffix}`);
    }
  } catch (e) {
    logger.visitor(`解析接口出错，错误信息: ${e && e.message || e}`);
  }
  next();
})

if (process.env.NODE_ENV == "development") {
  router.post('/86C1CCFA-E79F-4815-89F0-A788558AEAA6', function (req, res, next) {
    co(function* () {
      let result = yield spawning(path.resolve(`${__dirname}/../spawn/gitUpdater.js`))
      res.json(result)
    }).catch(e => {
      res.json({success: false, message: e && e.message || "未知异常"});
    })
  })
}
router.post("/getStore", async (req, res, next) => {
  if(req.session.profile){
    let connection
    let {user_type, org_code, user_id, sub_account} = req.session.profile,
      sub_user_id = sub_account && sub_account.sub_user_id || "",
      is_data_func = sub_account && sub_account.is_data_func || 0,
      asset_org_code = (user_type == 1) && org_code || "", fund_org_code = (user_type == 2) && org_code || "",
      relatedOrgsPromise,
      assetAccountPromise, fundAccountPromise
    await co(function* () {
      connection = yield getConnectionQ()
      let Query = promisify(connection.query, {multiArgs: true});
      switch (user_type) {
        case 1:
          relatedOrgsPromise = Query.call(connection, sqls.relatedOrgs, getMySQLFieldValue({org_code}))
          assetAccountPromise = Query.call(connection, sqls.getAssetAccount, getMySQLFieldValue({
            asset_org_code,
            fund_org_code,
          }))
          fundAccountPromise = Query.call(connection, sqls.getFundAccount, getMySQLFieldValue({
            asset_org_code,
            fund_org_code,
          }))
          break;
        case 2:
          relatedOrgsPromise = Query.call(connection, sqls.relatedOrgs, getMySQLFieldValue({org_code}))
          assetAccountPromise = Query.call(connection, sqls.getAssetAccount, getMySQLFieldValue({
            asset_org_code,
            fund_org_code
          }))
          fundAccountPromise = Query.call(connection, sqls.getFundAccount, getMySQLFieldValue({
            asset_org_code,
            fund_org_code,
          }))
          break;
        case 3:
        case 4:
          relatedOrgsPromise = Query.call(connection, sqls.relatedOrgs, {})
          assetAccountPromise = Promise.resolve([])
          fundAccountPromise = Promise.resolve([])
          break;
        default:
          relatedOrgsPromise = Promise.resolve([])
          assetAccountPromise = Promise.resolve([])
          fundAccountPromise = Promise.resolve([])
      }
      let [[rows], [relatedOrgs], [assetAccounts], [fundAccounts], [plainMenuFuncs], [deadlineList], [dateRange], [[nextWeek]], [dependencyRows],[dataRestriction]] = yield [
        Query.call(connection, sqls.dictionary, getMySQLFieldValue(req.body)),
        relatedOrgsPromise,
        assetAccountPromise,
        fundAccountPromise,
        Query.call(connection, sqls.userMenu, getMySQLFieldValue({user_id: sub_user_id || user_id})),
        Query.call(connection, sqls.deadline),
        Query.call(connection, sqls.getAllWeekAndDate),
        Query.call(connection, sqls.getNextWeek),
        connectionRunner(sqls.checkUserInfoIntegrity, {user_id}, req),
        sub_user_id ? connectionRunner(sqls.subUserDataFunc, {sub_user_id}, req) : Promise.resolve([]),
      ]
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
      req.session._menu = [...new Set(menu.map(r=>r.page_id))]
      req.session._submenu = [...new Set(submenu.map(r=>r.page_id))]
      req.session._button = [...new Set(button.map(r=>r.page_id))]

      // 检查用户信息完整性
      let dependencies = []
      if(Array.isArray(dependencyRows) && ((user_type == 1) || (user_type == 2))){
        if(dependencyRows.length){
          let {partner_nature} = dependencyRows[0]
          if((typeof partner_nature !== "string") || !partner_nature.trim()){
            dependencies.push({submenu: "user_attribute", hint: "您的用户平台属性还未完善，补完信息后才能操作哦！"})
          }
        } else {
          dependencies.push({submenu: "user_attribute", hint: "您的用户平台属性还未完善，补完信息后才能操作哦！"})
        }
      }

      let restriction = {}
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
              (fundDataRestriction.include(r.fund_org_code)) && (assetDataRestriction.includes(r.asset_org_code))
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

      res.json({success: true, store:{
          _session: req.session.profile,
          dictionary: {
            dictionary: rows, menu: tree, relatedOrgs, deadlineList,
            dateRange: dateRange.filter(item => item.week !== '00'), nextWeek, assetAccounts, fundAccounts,
            dependencies,
          }}})
      /*res.json({
        success: true, dictionary: rows, menu: tree, relatedOrgs, deadlineList,
        dateRange: dateRange.filter(item => item.week !== '00'), nextWeek, assetAccounts, fundAccounts
      })*/
      return rows
    }).catch(function (err) {
      res.json({success: true, store:{_session: req.session.profile}})
    }).then(() => {
      connection && connection.release();
    });
  } else {
    res.json({success: true, store:{}})
  }
})

router.post('/login', function (req, res, next) {
  let connection
  co(function* () {
    req.session && (delete req.session.profile)
    const {userAccount, password, captcha} = req.body;
    if(!userAccount || !password){
      throw new Error("用户名密码不能为空")
    }
    if(!isNaN(req.session.login_mistakes)){
      if(req.session.login_mistakes > 5){
        if(captcha){
          let {captcha: myCaptcha} = req.session
          if(myCaptcha){
            let {text,token} = myCaptcha
            if(Date.now() > (token + 60000)){
              throw new Error("验证码已过期，请刷新验证码")
            } else if(text.toLowerCase() !== captcha.toLowerCase()){
              throw new Error("验证码不匹配")
            }
          } else {
            throw new Error("系统没有查到验证码")
          }
        } else {
          throw new Error("请输入验证码")
        }
      }
    }
    connection = yield getConnectionQ(req)
    let rows = []
    let Query = promisify(connection.query, {multiArgs: true});
    if (userAccount && userAccount.includes(":")) {
      let userGroup = userAccount.split(":")
      let [preCheckRows] = yield Query.call(connection, sqls.login, getMySQLFieldValue({userAccount: userGroup[0]}))
      if (!preCheckRows || !preCheckRows[0]) {
        throw new Error("查无此主用户")
      }
      [rows] = yield Query.call(connection, sqls.subuserLogin, getMySQLFieldValue({
        userId: preCheckRows[0].user_id,
        userAccount: userGroup[1],
        password: password ? password.md5() : ''
      }))
      if (!rows || !rows[0]) {
        throw new Error("校验失败")
      }
      rows[0] = Object.assign({}, preCheckRows[0], {sub_account: rows[0], sub_user_id: rows[0].sub_user_id})
    } else {
      let [preCheckRows] = yield Query.call(connection, sqls.login, getMySQLFieldValue({userAccount}))
      if (!preCheckRows || !preCheckRows[0]) {
        throw new Error("查无此用户")
      }
      [rows] = yield Query.call(connection, sqls.login, getMySQLFieldValue({
        userAccount,
        password: password ? password.md5() : ''
      }))
    }
    if (!rows || !rows[0]) {
      throw new Error("校验失败")
    }
    let _session = Object.assign({surviving_days: getSurvivingDays()}, rows[0]);
    req.session.profile = _session
    //res.cookie('_edi_session', 1)
    /*yield sessionSaver(req.session)
    yield sessionReloader(req.session)*/
    delete req.session.login_mistakes
    delete req.session.captcha
    res.json({success: true, _session});
    return rows[0]
  }).then((data) => {
    // 登陆日志记录, 如果出错不算入登录错误中
    let logConnection
    co(function* () {
      logConnection = yield getWriteConnectionQ(req)
      let logQuery = promisify(logConnection.query, {
        multiArgs: true
      });
      let userAgent = req.headers['user-agent'],
        xForwardFor = req.headers['x-forwarded-for'],
        ua = uaParser(userAgent),
        {os, browser} = ua
      yield logQuery.call(logConnection, sqls.loginLog, getMySQLFieldValue({
        user_id: data.user_id,
        login_type: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ? 1 : 0,
        login_ip: xForwardFor || req.connection.remoteAddress || null,
        login_proxy_ip: !xForwardFor ? null : req.connection.remoteAddress,
        login_host_name: req.hostname,
        login_mac_address: req.session.id,
        login_browser: browser ? `${browser.name},${browser.version}` : null,
        login_system: os ? `${os.name},${os.version}` : null,
        create_user_id: data.user_id,
        sub_user_id: data.sub_user_id,
      }))
    }).catch((err) => {
      logger.error(err)
    }).then(() => {
      logConnection && logConnection.release();
    })
  }).catch(function (err) {
    let result = {
      success: false,
      message: err.message || "校验失败"
    }
    if(!req.session.login_mistakes){
      req.session.login_mistakes = 1
    } else {
      req.session.login_mistakes++
    }
    if(req.session.login_mistakes > 5){
      var captcha = svgCaptcha.create();
      captcha.token = Date.now()
      req.session.captcha = captcha;
      logger.info(captcha.data)
      //res.status(200).send(captcha.data);
      res.json({...result, captcha: `data:image/svg+xml;utf8,${captcha.data}`});
    } else {
      res.json(result);
    }
  }).then(() => {
    connection && connection.release();
  })
})

router.post("/getCaptcha", (req, res, next) => {
  if(req.session.profile){
    res.status(403).send("您已登录");
    return
  } else if (!req.session.login_mistakes || (req.session.login_mistakes < 5)){
    res.json({success:false});
    return
  }
  var captcha = svgCaptcha.create({ignoreChars: '0o1i'}); // 验证码字符中排除 0o1i
  captcha.token = Date.now()
  req.session.captcha = captcha
  res.json({success:true, captcha: `data:image/svg+xml;utf8,${encodeURIComponent(captcha.data)}`});
})

// Login以下的post都得依赖session，故有session checker
router.post("*", (req, res, next) => {
  if (!req.session.profile) {
    res.json({success: false, message: "登录超时，请重新登录", _expired: true})
    return
  }
  next();
})
router.post('/loginLogs', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {loginTimeStart, loginTimeEnd, userName, userType, pageIndex} = req.body,
      myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
      params = getMySQLFieldValue({
        loginTimeStart,
        loginTimeEnd,
        userName,
        userType,
        pageIndex: myPageIndex
      })
    let [[loginCountRows], [rows]] = yield [
      Query.call(connection, sqls.loginLogCount, params),
      Query.call(connection, sqls.loginLogQuery, params)
    ]
    if (!loginCountRows || !loginCountRows[0]) {
      throw new Error("无记录")
    }
    res.json({success: true, rows, total: loginCountRows[0].total})
    return rows
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});
router.post('/dictionary', (req, res, next) => {
  let connection
  let {user_type, org_code, user_id, sub_account} = req.session.profile,
    sub_user_id = sub_account && sub_account.sub_user_id || "",
    is_data_func = sub_account && sub_account.is_data_func || 0,
    asset_org_code = (user_type == 1) && org_code || "", fund_org_code = (user_type == 2) && org_code || "",
    relatedOrgsPromise,
    assetAccountPromise, fundAccountPromise
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    switch (user_type) {
      case 1:
        relatedOrgsPromise = Query.call(connection, sqls.relatedOrgs, getMySQLFieldValue({org_code}))
        assetAccountPromise = Query.call(connection, sqls.getAssetAccount, getMySQLFieldValue({
          asset_org_code,
          fund_org_code,
        }))
        fundAccountPromise = Query.call(connection, sqls.getFundAccount, getMySQLFieldValue({
          asset_org_code,
          fund_org_code,
        }))
        break;
      case 2:
        relatedOrgsPromise = Query.call(connection, sqls.relatedOrgs, getMySQLFieldValue({org_code}))
        assetAccountPromise = Query.call(connection, sqls.getAssetAccount, getMySQLFieldValue({
          asset_org_code,
          fund_org_code
        }))
        fundAccountPromise = Query.call(connection, sqls.getFundAccount, getMySQLFieldValue({
          asset_org_code,
          fund_org_code,
        }))
        break;
      case 3:
      case 4:
        relatedOrgsPromise = Query.call(connection, sqls.relatedOrgs, {})
        assetAccountPromise = Promise.resolve([[[]]])
        fundAccountPromise = Promise.resolve([[]])
        break;
      default:
        relatedOrgsPromise = Promise.resolve([[]])
        assetAccountPromise = Promise.resolve([[]])
        fundAccountPromise = Promise.resolve([[]])
    }
    let [[rows], [relatedOrgs], [assetAccounts], [fundAccounts], [plainMenuFuncs], [deadlineList], [dateRange], [[nextWeek]], [dependencyRows], [dataRestriction]] = yield [
      Query.call(connection, sqls.dictionary, getMySQLFieldValue(req.body)),
      relatedOrgsPromise,
      assetAccountPromise,
      fundAccountPromise,
      Query.call(connection, sqls.userMenu, getMySQLFieldValue({user_id: sub_user_id || user_id})),
      Query.call(connection, sqls.deadline),
      Query.call(connection, sqls.getAllWeekAndDate),
      Query.call(connection, sqls.getNextWeek),
      connectionRunner(sqls.checkUserInfoIntegrity, {user_id}, req),
      sub_user_id ? connectionRunner(sqls.subUserDataFunc, {sub_user_id}, req) : Promise.resolve([]),
    ]
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
    req.session._menu = [...new Set(menu.map(r=>r.page_id))]
    req.session._submenu = [...new Set(submenu.map(r=>r.page_id))]
    req.session._button = [...new Set(button.map(r=>r.page_id))]

    // 检查用户信息完整性
    let dependencies = []
    if(Array.isArray(dependencyRows) && ((user_type == 1) || (user_type == 2))){
      if(dependencyRows.length){
        let {partner_nature} = dependencyRows[0]
        if((typeof partner_nature !== "string") || !partner_nature.trim()){
          dependencies.push({submenu: "user_attribute", hint: "您的用户平台属性还未完善，补完信息后才能操作哦！"})
        }
      } else {
        dependencies.push({submenu: "user_attribute", hint: "您的用户平台属性还未完善，补完信息后才能操作哦！"})
      }
    }

    let restriction = {}
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

    res.json({
      success: true, dictionary: rows, menu: tree, relatedOrgs, deadlineList,
      dateRange: dateRange.filter(item => item.week !== '00'), nextWeek, assetAccounts, fundAccounts,
      dependencies
    })
    return rows
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "字典信息查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});
/*
router.post('/checkUserInfoIntegrity', function (req, res, next) {
  let dependencies = []
  let {user_id} = req.session.profile
  co(function* () {
    let [results] = yield connectionRunner(sqls.checkUserInfoIntegrity, {user_id}, req)
    if(Array.isArray(results) && results.length){
      let {partner_nature} = results[0]
      if((typeof partner_nature !== "string") || !partner_nature.trim()){
        dependencies.push({submenu: "userAttribute", hint: "您的用户平台属性还未完善，补完信息后才能操作哦！"})
      }
    } else {
      throw new Error("用户完整性数据异常")
    }
    res.json({success: true, dependencies})
    return results
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "用户数据异常，请联系管理员"
    });
  });
})*/

router.post('/logout', function (req, res, next) {
  req.session && (delete req.session.profile);
  if(req.session){
    delete req.session.profile;
    delete req.session._menu;
    delete req.session._submenu;
    delete req.session._button;
  }
  res.json({success: true})
  /*co(function*(){
    yield sessionSaver(req.session)
    yield sessionReloader(req.session)
  }).catch((err)=>{
    logger.error(err && err.message || "登出Session设置Couchbase出错")
  }).then(()=>{
    res.json({success: true})
  })*/
})

module.exports = router
