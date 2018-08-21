var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, getMySQLFieldValue, propertyChangeLogger} = require("../util"), router = Router();

/**
 * 作者：张俊杰，张宝玉
 * 模块：账户信息
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("asset_account")){
    res.json({success:false, message:"您没有调用账户信息页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let {fundOrgCode, assetOrgCode} = req.body,
      params = getMySQLFieldValue({
        assetOrgCode,
        fundOrgCode,
        ...req.session.subUserDataRestriction
      })
    let [[assetRows], [fundRows], [allRows]] = yield [
      Query.call(connection, sqls.assetAccountQuery, params),
      Query.call(connection, sqls.fundAccountQuery, params),
      Query.call(connection, sqls.assetFundAccountQuery, params)
    ]

    res.json({success: true, assetRows, fundRows, allRows})
    return assetRows
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});

router.post('/update', (req, res, next) => {
  if(!req.session._button.includes("asset_account_setting")){
    next();
    return
  }
  let connection, params = getMySQLFieldValue(req.body)
  co(function* () {
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    let old_value = ''
    try {
      yield  Transaction.call(connection)
      let [countRows] = yield Query.call(connection, req.session.profile.user_type == '1' ? sqls.assetAccountCheck : sqls.fundAccountCheck, params)
      if (!countRows || !countRows[0]) {
        throw new Error("查无此字段")
      }
      old_value = countRows[0]
      let [results] = yield Query.call(connection, req.session.profile.user_type == '1' ? sqls.assetAccountUpdate : sqls.fundAccountUpdate, params)
      if (results.affectedRows < 1) {
        throw new Error("该数据不存在，更新失败")
      }
      yield Commit.call(connection)
      if (results.changedRows < 1) {
        throw new Error("无需更新的字段")
      }
      let [rows] = yield Query.call(connection, req.session.profile.user_type == '1' ? sqls.assetAccountQuery : sqls.fundAccountQuery, getMySQLFieldValue({...params,...req.session.subUserDataRestriction}))
      if (!rows || !rows[0]) {
        throw new Error("已更新但查无记录")
      }
      res.json({success: true, data: rows[0], user_type: req.session.profile.user_type})
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function* () {
      let from_table = req.session.profile.user_type == '1' ? 't_asset_account' : 't_fund_account',
        logger = propertyChangeLogger(old_value,[
          {name: 'gathering_name', label: '收款账户名称'},
          {name: 'gathering_bank', label: '收款账户开户行'},
          {name: 'gathering_card_no', label: '收款账号'},
        ], params),
        from_table_key = `${params.asset_org_code},${params.fund_org_code},${params.account_purpose}`,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改账户信息 修改内容：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`
      yield writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log})
      return connection
    }).catch((err) => {
      logger.info(err)
      return connection
    })
  }).catch((err) => {
    res.json({
      success: false,
      message: err.message || "更新失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});

module.exports = router
