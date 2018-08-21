var {getConnectionQ, getWriteConnectionQ,writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, getMySQLFieldValue} = require("../util"),
  router = Router();

/**
 * 作者：张俊杰
 * 模块：还款计划表
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("repayment_plan")){
    res.json({success:false, message:"您没有调用还款计划表页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {

  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {userType} = req.body,
      params = getMySQLFieldValue({
        org_code:req.session.profile.user_type == '3' ? '' : req.session.profile.org_code,
        ...req.session.subUserDataRestriction,
      })

    let sql
    if (req.session.profile.user_type == '1') {
      sql=sqls.repaymentPlanAsset
    } else if (req.session.profile.user_type == '2') {
      sql=sqls.repaymentPlanFund
    }else if (req.session.profile.user_type == '3') {
      sql=userType=='fund_org_code' ? sqls.repaymentPlanAsset : sqls.repaymentPlanFund
    }

    let [[rows]] = yield [
      Query.call(connection, sql, params),

    ]
    res.json({success: true, rows})
    return rows
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(()=>{
    connection && connection.release();
  });
});

module.exports = router
