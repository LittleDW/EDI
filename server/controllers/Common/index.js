/**
 * @author robin
 * @file index
 * @date 2018-03-30 12:54
 * @feature：所有http请求的入口，用于解析cookie，提取session，记录访问，验证登录，登录日志，调用字典，登出等共通的接口
 */
var path = require("path"), _ = require("lodash"),
  cookieParser = require('cookie-parser'), bodyParser = require('body-parser'), {session} = require('../../session'),
  configure = require('../../../config/configure.json')[process.env.NODE_ENV],
  {logger, getMySQLFieldValue, spawning, getSurvivingDays} = require("../../util"),
  svgCaptcha = require('svg-captcha'),
  {getDictionary, login, loginLog, loginLogCount, operLogCombinedQuery, financeOperLogQuery, operLogQuery, getCaptcha,
    simplyLogItService,simplyLogTableService} = require('../../services').business.common;


const cookieParserCtrl = cookieParser('shiqifeng2000@gmail.com')
const bodyParserJsonCtrl = bodyParser.json({limit: '50mb'})
const bodyParserUrlencodedCtrl = bodyParser.urlencoded({extended: true});
const sessionCtrl = session
const sessionCheckCtrl = async (req, res, next) => {
  if (_.isNil(req.session)) {
    return res.json({success: false, message: "Session 初始化失败，请联系管理员"})
  }
  next()
}
const visitorCtrl = async (req, res, next) => {
  req.setTimeout(configure.safeTimeout);
  let suffix = `
      header信息:
${Object.keys(req.headers).map(r => `  \t\t\t${r}:${JSON.stringify(req.headers[r])}`).join(",\n")},
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
};
const gitCtrl = async (req, res, next) => {
  let result = await spawning(path.resolve(`${__dirname}/../../spawn/gitUpdater.js`))
  res.json(result)
};
const getStoreCtrl = async (req, res, next) => {
  if (req.session.profile) {
    try {
      let dictionary = await getDictionary(req.session.profile, req)
      res.json({
        success: true,
        store: {
          _session: req.session.profile,
          dictionary
        }
      })
    } catch (e) {
      res.json({success: true, store: {_session: req.session.profile}})
    }
  } else {
    res.json({success: true, store: {}})
  }
};

const dictionaryCtrl = async (req, res, next) => {
  try {
    let dictionary = await getDictionary(req.session.profile, req)
    res.json({
      success: true,
      ...dictionary
    })
  } catch (e) {
    res.json({success: false, message: "字典信息查询失败"});
  }
};

const loginCtrl = async (req, res, next) => {
  if (req.session) {
    delete req.session.profile
  }
  const {userAccount, password, captcha} = req.body;
  if (_.isEmpty(userAccount) || _.isEmpty(password)) {
    throw new Error("用户名密码不能为空")
  }
  if (!isNaN(req.session.login_mistakes)) {
    if (req.session.login_mistakes > 5) {
      if (captcha) {
        let {captcha: myCaptcha} = req.session
        if (myCaptcha) {
          let {text, token} = myCaptcha
          if (Date.now() > (token + 60000)) {
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
  try {
    let _session = await login({userAccount, password}, req);
    //_session = _session.dataValues;
    _session = Object.assign({surviving_days: getSurvivingDays()}, _session);
    req.session.profile = _session
    delete req.session.login_mistakes
    delete req.session.captcha
    await loginLog({
      user_id: _session.user_id,
      sub_user_id: _session.sub_user_id,
    }, req).catch(err => {
      logger.error(err)
    });
    return res.json({success: true, _session});


  } catch (e) {
    let result = {success: false, message: e.message || "校验失败"}
    if (!req.session.login_mistakes) {
      req.session.login_mistakes = 1
    } else {
      req.session.login_mistakes++
    }
    if (req.session.login_mistakes > 5) {
      var newCaptcha = svgCaptcha.create();
      newCaptcha.token = Date.now()
      req.session.captcha = newCaptcha;
      res.json({...result, captcha: `data:image/svg+xml;utf8,${newCaptcha.data}`});
    } else {
      res.json(result);
    }
  }
};

const getCaptchaCtrl = async (req, res, next) => {
  if (req.session.profile) {
    res.status(403).send("您已登录");
    return
  } else if (!req.session.login_mistakes || (req.session.login_mistakes < 5)) {
    res.json({success: false});
    return
  }
  var captcha = await getCaptcha();
  req.session.captcha = captcha;
  res.json({success:true, captcha: `data:image/svg+xml;utf8,${encodeURIComponent(captcha.data)}`});
};

const loginCheckCtrl = async (req, res, next) => {
  if (!req.session.profile) {
    res.json({success: false, message: "登录超时，请重新登录", _expired: true})
    return
  }
  next();
};

const logoutCtrl = async (req, res, next) => {
  if (!_.isNil(req.session)) {
    delete req.session.profile
    delete req.session._menu;
    delete req.session._submenu;
    delete req.session._button;
  }
  res.json({success: true})
};

const financeOperLogSearchCtrl = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body)
  let rows = await financeOperLogQuery(params,req)
  if (!rows || !rows[0]) {
    throw new Error("无记录")
  }
  res.json({success: true, rows})
};

const operLogSearchCtrl = async (req, res, next) => {
  //let params = getMySQLFieldValue(req.body)
  let {pageIndex} = req.body, myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
    params = getMySQLFieldValue({...req.body, pageIndex: myPageIndex,})
  let {count, rows} = await operLogQuery(params,req)
  if (count<1) {
    throw new Error("无记录")
  }
  res.json({success: true, rows, total: count})
};

const operLogCombinedSearchCtrl = async (req, res, next) => {
  //let params = getMySQLFieldValue(req.body)
  let {pageIndex} = req.body, myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
    params = getMySQLFieldValue({...req.body, pageIndex: myPageIndex,})
  let {count, rows} = await operLogCombinedQuery(params,req)
  if (count<1) {
    throw new Error("无记录")
  }
  res.json({success: true, rows, total: count})
};

const simplyLogItCtrl = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body)
  await simplyLogItService(params,req)
  res.json({success: true})
};

const simplyLogTableCtrl = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body)
  await simplyLogTableService(params,req)
  res.json({success: true})
};

module.exports = {
  cookieParserCtrl,
  bodyParserJsonCtrl,
  bodyParserUrlencodedCtrl,
  sessionCtrl,
  sessionCheckCtrl,
  visitorCtrl,
  getStoreCtrl,
  dictionaryCtrl,
  loginCtrl,
  getCaptchaCtrl,
  loginCheckCtrl,
  logoutCtrl,
  gitCtrl,
  financeOperLogSearchCtrl,
  operLogSearchCtrl,
  operLogCombinedSearchCtrl,
  simplyLogItCtrl,
  simplyLogTableCtrl
};
