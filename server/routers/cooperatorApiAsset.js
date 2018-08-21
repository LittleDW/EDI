var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, getMySQLFieldValue, propertyChangeLogger, operLogDictionaryGenerator} = require("../util"),
  router = Router();

/**
 * 作者：张宝玉
 * 模块：资产方API地址维护
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("cooperator_api_asset")){
    res.json({success:false, message:"您没有调用API地址管理页面接口的权限"})
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
      myPageIndex = (isNaN(body.pageIndex) || (body.pageIndex < 1)) ? 0 : 10 * (body.pageIndex - 1),
      params = getMySQLFieldValue({...req.session.subUserDataRestriction, body, pageIndex: myPageIndex})
    let [[countRows], [rows]] = yield [
      Query.call(connection, sqls.cooperatorApiAssetCount, params),
      Query.call(connection, sqls.cooperatorApiAssetQuery, params)
    ]
    if (!countRows || !countRows[0]) {
      throw new Error("无记录")
    }
    res.json({success: true, rows, total: countRows[0].total})
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

router.post('/create', (req, res, next) => {
  if(!req.session._button.includes("cooperator_api_asset_create")){
    next();
    return
  }

  let connection, {asset_org_code,api_type} = req.body,
    params = getMySQLFieldValue(Object.assign({}, req.body, {

    })), old_value
  co(function*() {

    connection = yield getWriteConnectionQ(req)

    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      let [preQueryRows] = yield Query.call(connection, sqls.cooperatorApiAssetCheck, params)
      if (preQueryRows && preQueryRows[0]) {
        throw new Error("数据已经存在")
      }

      let [[results]] = yield [
        Query.call(connection,sqls.cooperatorApiAssetCreate, params)
      ]
      if (results.affectedRows < 1) {
        throw new Error("API地址维护失败")
      }
      yield Commit.call(connection)

      let [[newCountRows], [rows]] = yield [
        Query.call(connection, sqls.cooperatorApiAssetCount, {}),
        Query.call(connection, sqls.cooperatorApiAssetQuery, {page_index: 0})
      ]
      if (!newCountRows || !newCountRows[0] || (newCountRows[0].total < 1)) {
        throw new Error("已创建，但查找失败")
      }
      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }
      res.json({success: true, rows, total: newCountRows[0].total})
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection}) => {
    return co(function*() {

      let from_table = 't_asset_api',logger,oper_log,
        from_table_key = asset_org_code+','+api_type,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        create_sub_user_id = req.session.profile.sub_user_id;
      params = operLogDictionaryGenerator('*', ['api_type'], params);
      logger = propertyChangeLogger({}, [
        {name: 'asset_org_code', label: '资产方API'},
        {name: 'api_type', label: 'API类型'},
        {name: 'api_url', label: 'API地址'},
        {name: 'api_token', label: '握手token'},
      ], params)
      oper_log = `动作：修改API地址表 修改内容：添加API地址：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

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

router.post('/update', (req, res, next) => {
  if(!req.session._button.includes("cooperator_api_asset_update")){
    next();
    return
  }

  let connection, {asset_org_code,api_type} = req.body,
    params = getMySQLFieldValue(Object.assign({}, req.body, {

    })), old_value
  co(function*() {

    connection = yield getWriteConnectionQ(req)

    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      let [preQueryRows] = yield Query.call(connection, sqls.cooperatorApiAssetCheck, params)
      if (preQueryRows && preQueryRows[0]) {
        old_value = preQueryRows[0]
      }

      let [[results]] = yield [
        Query.call(connection,sqls.cooperatorApiAssetUpdate, params)
      ]
      if (results.affectedRows < 1) {
        throw new Error("API地址维护失败")
      }
      yield Commit.call(connection)

      let [rows] = yield Query.call(connection, sqls.cooperatorApiAssetCheck, {asset_org_code,api_type})
      if (!rows || !rows[0]) {
        throw new Error("已更新但查无记录")
      }
      res.json({success: true, data: rows[0]})

      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function*() {

      let from_table = 't_asset_api',logger,oper_log,
        from_table_key = asset_org_code+','+api_type,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        create_sub_user_id = req.session.profile.sub_user_id;
      logger = propertyChangeLogger(old_value,[
        {name: 'api_url', label: 'API地址'},
        {name: 'api_token', label: '握手token'}
      ], params)
      oper_log = `动作：修改API地址表 修改内容：修改API地址：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

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

router.post('/delete', (req, res, next) => {
  if(!req.session._button.includes("cooperator_api_asset_delete")){
    next();
    return
  }
  let connection, {asset_org_code,api_type} = req.body,
    params = getMySQLFieldValue(req.body, {
      asset_org_code: asset_org_code,
      api_type: api_type,
    })
  co(function*() {
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true})
    try {
      yield  Transaction.call(connection)
      let [queryResults] = yield Query.call(connection, sqls.cooperatorApiAssetCheck, params)
      if (!queryResults[0]) {
        throw new Error("数据不存在，请重新核对")
      }

      let [results] = yield Query.call(connection, sqls.cooperatorApiAssetDelete, params)
      if (results.affectedRows < 1) {
        throw new Error("数据删除失败")
      }
      yield Commit.call(connection)

      res.json({success: true})
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection}
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
