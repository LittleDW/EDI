var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, propertyChangeLogger} = require("../util"),
  router = Router();

/**
 * 作者：张俊杰
 * 模块：资金分配设置
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("fund_setting")){
    res.json({success:false, message:"您没有调用资金分配设置页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let {match_date} = req.body
    let fund_org_code = req.session.profile.org_code
    let [fundList] = yield Query.call(connection, sqls.fundSettingGet, {fund_org_code, match_date})

    if (!fundList) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      fundList
    })
    return fundList
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  })
})

router.post('/update', (req, res, next) => {
  if(!req.session._button.includes("fund_setting_update")){
    next();
    return
  }
  let connection, connectionR,  {fund_fee, asset_org_code, fund_org_code, match_date} = req.body
  let params = {fund_fee, asset_org_code, fund_org_code, match_date}
  co(function* () {
    connection = yield getWriteConnectionQ(req)
    connectionR = yield getConnectionQ(req)
    let Commit = promisify(connection.commit).bind(connection),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {
        multiArgs: true
      }),
      QueryR = promisify(connectionR.query, {
        multiArgs: true
      });
    try {
      let [[old_value]] = yield QueryR.call(connection, sqls.fundSettingGet, params)
      let [fundFeeResult] = yield Query.call(connection, sqls.fundSettingUpdateAssetFee, params)
      let [otherFeeResult] = yield Query.call(connection, sqls.fundSettingUpdateOtherFee, params)
      if (!fundFeeResult || fundFeeResult.affectedRows === 0) {
        throw new Error("资产方供给量更新失败")
      }
      if (!otherFeeResult || otherFeeResult.affectedRows === 0) {
        throw new Error("匹配量更新失败")
      }
      let [fundList] = yield Query.call(connection, sqls.fundSettingGet, {fund_org_code, match_date})
      if (!fundList) {
        throw new Error("重新获取资产分配设置列表失败")
      }
      yield Commit()
      res.json({
        success: true,
        fundList
      })
      return {connection, connectionR, old_value}
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "保存失败")
    }
  }).then(({connection, connectionR, old_value}) => {
    let writeLog = async () => {
      let from_table = 't_asset_fund_fee',
        logger = propertyChangeLogger(old_value, [
          {name: 'fund_fee', label: '资金方募集量'}
        ], params),
        from_table_key = `${params.asset_org_code},${params.fund_org_code},${params.match_date}`,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改分配设置 修改内容：${!logger.some(log => log.log) ? '未更新任何新值' : [].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`
      await writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log})
      return {connection, connectionR}
    }
    return writeLog().catch(e => {

    })
  }).then(({connection, connectionR}) => {
    connection && connection.release();
    connectionR && connectionR.release();
  }).catch((err) => {
    res.json({
      success: false,
      message: err.message || "保存失败"
    });

  });
})
module.exports = router
