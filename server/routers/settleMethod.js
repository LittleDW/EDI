var {getConnectionQ,getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, oss,  BusBoy, appendUUID, getMySQLFieldValue, thunkifyEvent, propertyChangeLogger, operLogDictionaryGenerator} = require("../util"),
  router = Router(),configure = require('../../config/configure.json')[process.env.NODE_ENV];

/**
 * 作者：张俊杰
 * 模块：结算方式
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("settle_method")){
    res.json({success:false, message:"您没有调用结算方式页面接口的权限"})
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
    let {
      fundOrgCode,
      assetOrgCode
    } = req.body
    let params = getMySQLFieldValue({
      fundOrgCode,
      assetOrgCode,
      ...req.session.subUserDataRestriction,
    })
    let [methodList] = yield Query.call(connection, sqls.settleMethodSearch, params)
    if (!methodList || !methodList[0]) {
      throw new Error("无记录")
    }
    res.json({
      success: true,
      methodList
    })
    return methodList
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
  if(!req.session._button.includes("settle_method_oper")){
    next();
    return
  }
  let busboy = new BusBoy({headers: req.headers, limits: {fieldNameSize: 200, fieldSize: 5242880}}), param = {}, connection, connectionR;

  try {
    let fieldThunk = thunkifyEvent({
      emitter: busboy,
      event: 'field',
      gen: function* (fieldname, val, fieldnameTruncated) {
        param[fieldname] = val
      }
    })
    let fileThunk = thunkifyEvent({
      emitter: busboy,
      event: 'file',
      gen: function* (fieldname, file, filename, encoding, mimetype) {
        let result = yield oss.putStream(`${appendUUID(filename)}`, file)
        param[fieldname] = result.url.replace(/^http:\/\/.+?\//, configure.oss.host).trim();
        return Promise.resolve()
      }
    })
    thunkifyEvent({
      emitter: busboy, event: "finish", gen: function* () {
        connection = yield getWriteConnectionQ(req)
        connectionR = yield getConnectionQ(req)
        yield fileThunk.collect()
        let RollBack = promisify(connection.rollback),
          Query = promisify(connection.query, {multiArgs: true});
        let QueryR = promisify(connectionR.query, {multiArgs: true})
        let [[old_value]] = yield QueryR.call(connection, sqls.settleMethodSearch, {asset_org_code: param.asset_org_code, fund_org_code: param.fund_org_code})
        try {
          let [results] = yield Query.call(connection, sqls.settleMethodUpdate, param)
          if (results.changedRows < 1) {
            throw new Error("无需要更新的字段")
          }
          res.json({success: true})
          old_value.total_rate = old_value.total_rate + '%';
          param.total_rate = param.total_rate + '%';
          old_value = operLogDictionaryGenerator('t_asset_fund', ['interest_mode', 'service_mode'], old_value);
          param = operLogDictionaryGenerator('t_asset_fund', ['interest_mode', 'service_mode'], param);
          let from_table = 't_asset_fund',
            logger = propertyChangeLogger(old_value, [
              {name: 'total_rate', label: '综合费率'},
              {name: 'interest_mode', label: '计息方式'},
              {name: 'guarantee_url', label: '担保函'},
              {name: 'borrow_agreements_url', label: '借款服务协议样本'},
              {name: 'cooperative_agreements_url', label: '合作协议'},
              {name: 'due_diligence_url', label: '尽调报告'},
              {name: 'other_agreements_url', label: '其他协议'},
              {name: 'service_mode', label: '服务费结算方式'},
            ], param),
            from_table_key = `${param.asset_org_code},${param.fund_org_code}`,
            from_org_code = req.session.profile.org_code,
            create_user_id = req.session.profile.user_id,
            sub_user_id = req.session.profile.sub_user_id;
          let oper_log = `动作：修改结算方式 修改内容：${!logger.some(log => log.log) ? '未更新任何新值' : [].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`
          yield writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log})
        } catch (e) {
          yield RollBack.call(connection)
          res.json({
            success: false,
            message: e.message || "更新失败"
          })
        }
      }
    })
    req.pipe(busboy)
  } catch (e) {
    res.json({
      success: false,
      message: e.message || "更新失败"
    })
  } finally {
    connection && connection.release();
    connectionR && connectionR.release();
  }
});

module.exports = router
