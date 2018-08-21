var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, getMySQLFieldValue, propertyChangeLogger, operLogDictionaryGenerator, operLogDictionaryGeneratorWithSplit} = require("../util"),
  router = Router();

/**
 * 作者：张宝玉
 * 模块：平台属性
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("user_attribute") && !req.session._submenu.includes("requirement_plan_new") && !req.session._submenu.includes("collection_plan_new")){
    res.json({success:false, message:"您没有调用平台属性页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let body = req.body,
      params = getMySQLFieldValue(Object.assign({}, body, {user_id: req.session.profile.user_id}))
    let [[rows]] = yield Query.call(connection, sqls.UserAttributeQuery, params)

    if (!rows) {
      throw new Error("数据不存在")
    }

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

router.post('/productDeadline', (req, res) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let body = req.body,
      params = getMySQLFieldValue(Object.assign({}, body, {}))
    let [[rows]] = yield [
      Query.call(connection, sqls.UserAttributeDeadline, params)
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


router.post('/save', (req, res, next) => {
  // if(!req.session._button.includes("cooperator_api_asset_update")){
  //   next();
  //   return
  // }

  let connection, {api_url} = req.body,
    params = getMySQLFieldValue(Object.assign({}, req.body, {
      user_id:req.session.profile.user_id
    })), old_value
  co(function*() {

    connection = yield getWriteConnectionQ(req)

    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      let [preQueryRows] = yield Query.call(connection, sqls.UserAttributeQuery, {user_id: req.session.profile.user_id})

      if (!preQueryRows || !preQueryRows[0]) {
        throw new Error("数据不存在")
      }
      old_value = preQueryRows[0]
      let org_code = preQueryRows[0].org_code
      params = {...params,'fund_org_code': org_code}

      let [results] = yield Query.call(connection, sqls.UserAttributeUpdate, params)

      if (results.affectedRows < 1) {
        throw new Error("平台属性更新失败")
      }

      if (req.session.profile.user_type == 2) {
        if(api_url){
          let [checkFundApiRows] = yield Query.call(connection, sqls.UserAttributeFundApiUrlCheck, params)

          let [[resultsFund]] = yield [
            Query.call(connection, (checkFundApiRows && checkFundApiRows[0]) ? sqls.UserAttributeFundApiUrlUpdate : sqls.UserAttributeFundApiUrlCreate, params)
          ]

          if (resultsFund.affectedRows < 1) {
            throw new Error("业务端口更新失败")
          }
        } else {
          yield Query.call(connection, sqls.UserAttributeFundApiUrlDelete, params)
        }
      }

      yield Commit.call(connection)

      res.json({success: true})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function*() {

      let from_table = 't_user_attribute',logger,oper_log,
        from_table_key = req.session.profile.user_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        create_sub_user_id = req.session.profile.sub_user_id;
      old_value = operLogDictionaryGenerator('t_user_attribute', ['partner_nature', 'is_debt_exchange', 'is_deadline_favor'], old_value);
      params = operLogDictionaryGenerator('t_user_attribute', ['partner_nature', 'is_debt_exchange', 'is_deadline_favor'], params);
      old_value = operLogDictionaryGeneratorWithSplit('t_user_attribute', ['repayment_mode', 'product_deadline'], old_value);
      params = operLogDictionaryGeneratorWithSplit('t_user_attribute', ['repayment_mode', 'product_deadline'], params);
      logger = propertyChangeLogger(old_value, [
        {name: 'partner_nature', label: '合作方性质'},
        {name: 'is_debt_exchange', label: '是否支持债转'},
        {name: 'is_deadline_favor', label: '期限偏好'},
        {name: 'repayment_mode', label: '还款方式'},
        {name: 'product_deadline', label: '产品期限要求'},
        {name: 'supervise_bank', label: '监管银行'},
        {name: 'api_url', label: 'API地址'}
      ], params)
      oper_log = `动作：修改平台属性表 修改内容：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

      yield [
        writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id: create_sub_user_id, oper_log}),
      ]
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
  }).then(()=>{
    connection && connection.release();
  });
});


module.exports = router
