var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  configure = require('../../config/configure.json')[process.env.NODE_ENV],
  {logger, co, Router} = require("../util"),
  router = Router();

/**
 * 作者：马博晓
 * 模块：个人签章
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("personal_certificate") && !req.session._submenu.includes("enterprise_certificate") && !req.session._submenu.includes("mixed_certificate")){
    res.json({success:false, message:"您没有调用个人签章页面接口的权限"})
    return
  }
  next();
})

router.post('/get', (req, res, next) => {
  co(function* () {
    let certificateHost = configure.certificate.host
    let user_account = req.session.profile.user_account
    let timestamp = Date.now()
    let token = `${user_account}${timestamp}`.md5()
    let url = `${certificateHost}/?user=${user_account}&timestamp=${timestamp}&token=${token}`
    res.json({success: true, certificateUrl: url})
  }).catch(e => {
    res.json({success: false, message: e && e.message || "未知异常"});
  })
});

module.exports = router
