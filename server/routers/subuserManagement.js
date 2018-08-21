var {getConnectionQ, getWriteConnectionQ, writeOperLog, connectionRunner, writeConnectionRunner} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, uuidv4, getMySQLFieldValue, propertyChangeLogger} = require("../util"),
  router = Router();

/**
 * 作者：马博晓
 * 模块：子用户信息管理页面
 * 修改：石奇峰，增加了必填项的二次验证
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("sub_user_management")){
    res.json({success:false, message:"您没有调用子用户信息页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let user_id = req.session.profile.user_type==4?"":req.session.profile.user_id
    let body = req.body,
      myPageIndex = (isNaN(body.pageIndex) || (body.pageIndex < 1)) ? 0 : 10 * (body.pageIndex - 1),
      params = getMySQLFieldValue(Object.assign({}, body, {pageIndex: myPageIndex}, {user_id}))
    let [[countRows], [rows]] = yield [
      Query.call(connection, sqls.subUserManageCount, params),
      Query.call(connection, sqls.subUserManageQuery, params)
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
  }).then(() => {
    connection && connection.release();
  });
});
router.post('/getRestriction', (req, res, next) => {
  if(!req.session._button.includes("sub_user_management_restrict")){
    next();
    return
  }
  let connection, params = getMySQLFieldValue(req.body)
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {
      multiArgs: true
    });
    let [[rows],[isDataFuncRows]] = yield [
      Query.call(connection, sqls.subUserDataFunc, params),
      Query.call(connection, sqls.subUserQuery, params)
    ]
    if (!isDataFuncRows || !isDataFuncRows[0]) {
      throw new Error(`无此子用户信息`)
    }
    res.json({
      success: true,
      rows,
      restrictionFlag: isDataFuncRows[0].is_data_func
    })
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
router.post('/updateRestriction', (req, res, next) => {
  if(!req.session._button.includes("sub_user_management_restrict")){
    next();
    return
  }
  let connection, {data, sub_user_id, is_data_func} = req.body
  if(!Array.isArray(data)){
    return res.json({
      success: false,
      message: "更新数据不完整"
    });
  }

  co(function* () {
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});

    try {
      yield  Transaction.call(connection)

      yield [
        Query.call(connection, sqls.subUserRestrictionDelete, {sub_user_id}),
        Query.call(connection, sqls.subUserRestrictionUpdate, {sub_user_id, is_data_func}),
      ]

      yield data.map(r=>Query.call(connection, sqls.subUserRestrictionAdd, {sub_user_id, ...r}))

      yield Commit.call(connection)

      // 严格检查 非主键 user_type也检查
      let [results] = yield data.map(r=>Query.call(connection, sqls.subUserRestrictionQuery, {sub_user_id, ...r}))
      results.forEach(r=>{
        if (!r || !r[0]) {
          throw new Error(`已更新但查无${r.partner_org_code}的记录`)
        }
      })
      res.json({success: true})
    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
  }).then(() => {
    return co(function* () {
      let from_table = 't_sub_user',
        from_table_key = sub_user_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        create_sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改子用户数据权限 修改内容: ${JSON.stringify(data.map(r=>({sub_user_id,...r})))}`

      yield [
        writeOperLog(connection, {
          from_table,
          from_table_key,
          from_org_code,
          create_user_id,
          sub_user_id: create_sub_user_id,
          oper_log
        }),
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
  }).then(() => {
    connection && connection.release();
  });
});
router.post('/create', (req, res, next) => {
  if(!req.session._button.includes("sub_user_management_create")){
    next();
    return
  }
  let connection, {user_account, user_name, new_password} = req.body, sub_user_id = uuidv4(), user_id = req.session.profile.user_id,
    params = getMySQLFieldValue(Object.assign({}, req.body, {
      sub_user_id: sub_user_id,
      user_id: user_id,
      password: req.body.new_password ? req.body.new_password.md5() : '',
      use_yn: 'Y',
      create_user_id: user_id,
    }))
  co(function* () {
    if(!user_account){
      throw new Error("用户账号不能为空")
    } else if(!user_name){
      throw new Error("用户名不能为空")
    } else if(!new_password){
      throw new Error("用户密码不能为空")
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)
      let [countRows] = yield Query.call(connection, sqls.subUserManagePreCount, params)
      if (countRows[0] && (countRows[0].total > 0)) {
        throw new Error(`账号名[${user_account}]已存在，请使用其他账号名称`)
      }
      let [[results]] = yield [
        Query.call(connection, sqls.subUserManageCreate, params),
      ]
      if (results.affectedRows < 1) {
        throw new Error("用户添加失败")
      }
      yield Commit.call(connection)

      res.json({success: true, /*rows, total: newCountRows[0].total*/})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return connection
  }).then((connection) => {
    return co(function* () {
      let from_table = 't_sub_user',
        logger = propertyChangeLogger({}, [
          {name: 'sub_user_id', label: '子账户ID'},
          {name: 'user_id', label: '主账户ID'},
          {name: 'user_account', label: '用户账号'},
          {name: 'password', label: '用户密码'},
          {name: 'user_name', label: '用户姓名'},
          {name: 'tel', label: '用户电话'},
          {name: 'mobile', label: '用户手机'},
          {name: 'email', label: '用户邮箱'},
        ], params),
        from_table_key = sub_user_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = user_id,
        create_sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改子用户表 修改内容：添加子用户：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

      yield [
        writeOperLog(connection, {
          from_table,
          from_table_key,
          from_org_code,
          create_user_id,
          sub_user_id: create_sub_user_id,
          oper_log
        }),
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
  }).then(() => {
    connection && connection.release();
  });
});
router.post('/update', (req, res, next) => {
  if(!req.session._button.includes("sub_user_management_update")){
    next();
    return
  }
  let connection, {user_account, user_name, sub_user_id} = req.body,
    params = getMySQLFieldValue(Object.assign({}, req.body, {
      password: req.body.new_password ? req.body.new_password.md5() : '',
    })), old_value
  co(function* () {
    if(!user_account){
      throw new Error("用户账号不能为空")
    } else if(!user_name){
      throw new Error("用户名不能为空")
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)

      let [preQueryRows] = yield Query.call(connection, sqls.subUserQuery, params)
      if (!preQueryRows || !preQueryRows[0]) {
        throw new Error("查无此字段")
      }
      old_value = preQueryRows[0]

      let [[results]] = yield [
        Query.call(connection, sqls.subUserManageUpdate, params)
      ]
      if (results.affectedRows < 1) {
        throw new Error("子用户修改失败")
      }
      yield Commit.call(connection)

      let [rows] = yield Query.call(connection, sqls.subUserQuery, {sub_user_id})
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
    return co(function* () {
      let from_table = 't_sub_user',
        logger = propertyChangeLogger(old_value, [
          {name: 'user_account', label: '用户账号'},
          {name: 'password', label: '用户密码'},
          {name: 'user_name', label: '用户姓名'},
          {name: 'tel', label: '用户电话'},
          {name: 'mobile', label: '用户手机'},
          {name: 'email', label: '用户邮箱'},
        ], params),
        from_table_key = sub_user_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        create_sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改子用户表 修改内容：修改子用户：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

      yield [
        writeOperLog(connection, {
          from_table,
          from_table_key,
          from_org_code,
          create_user_id,
          sub_user_id: create_sub_user_id,
          oper_log
        }),
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
  }).then(() => {
    connection && connection.release();
  });
});
router.post('/delete', (req, res, next) => {
  if(!req.session._button.includes("sub_user_management_delete")){
    next();
    return
  }
  let connection, {sub_user_id} = req.body, user_id = req.session.profile.user_id,
    params = getMySQLFieldValue(req.body, {
      user_id: user_id,
    }), old_value
  co(function* () {
    if(!sub_user_id){
      throw new Error("子账号不能为空")
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true})
    try {
      yield  Transaction.call(connection)
      let [queryResults] = yield Query.call(connection, sqls.subUserQuery, params)
      if (!queryResults[0]) {
        throw new Error("子用户已不存在，请重新核对")
      }
      old_value = queryResults[0]

      let [results] = yield Query.call(connection, sqls.subUserManageDelete, params)
      if (results.affectedRows < 1) {
        throw new Error("子用户删除失败")
      }
      yield Commit.call(connection)

      res.json({success: true, /*rows, total: countRows[0].total*/})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function* () {
      let from_table = 't_sub_user',
        from_table_key = old_value.sub_user_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = user_id,
        create_sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改子用户表 修改内容：删除用户：${old_value.sub_user_id}, 用户账号 ${old_value.user_account}`

      yield [
        writeOperLog(connection, {
          from_table,
          from_table_key,
          from_org_code,
          create_user_id,
          sub_user_id: create_sub_user_id,
          oper_log
        }),
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
  }).then(() => {
    connection && connection.release();
  });
});
router.post('/authSearch', (req, res, next) => {
  let connection, {sub_user_id} = req.body, user_id = req.session.profile.user_id
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let [[mainUserMenusRows], [subUserMenusRows]] = yield [
      Query.call(connection, sqls.mainUserMenusSearch, {user_id: user_id}),
      Query.call(connection, sqls.userFuncQuery, {user_id: sub_user_id})
    ]
    if (!mainUserMenusRows || !mainUserMenusRows[0]) {
      throw new Error("无记录")
    }

    let menus = new Array();
    let checked = new Array();
    let expanded = new Set();

    let menuMap = new Map();
    for (let row of mainUserMenusRows) {
      let funcId = row.func_id;
      let funcName = row.func_name;
      let fFuncId = row.f_func_id;
      let leaf = new Object();
      leaf.value = funcId;
      leaf.label = funcName;
      leaf.children = []

      menuMap.set(funcId, leaf);
      expanded.add(funcId)

      if (fFuncId != null && fFuncId != undefined && fFuncId.length > 0) {
        let fNode = menuMap.get(fFuncId)
        fNode.children.push(leaf);
      } else {
        menus.push(leaf);
      }
    }

    for (let row of subUserMenusRows) {
      if (expanded.has(row.func_id)) {
        checked.push(row.func_id);
      }
    }

    res.json({success: true, menus: menus, checked: checked, expanded: Array.from(expanded)})
    return connection
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(() => {
    connection && connection.release();
  });
});
router.post('/auth', (req, res, next) => {
  if(!req.session._button.includes("sub_user_management_auth")){
    next();
    return
  }
  let connection, sub_user_id = req.body.user_id, user_id = req.session.profile.user_id,
    checked = req.body.checked
  co(function* () {
    if(!sub_user_id){
      throw new Error("子账号不能为空")
    } else if (!checked){
      throw new Error("子账号权限不能为空")
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true})
    try {
      yield  Transaction.call(connection)

      yield Query.call(connection, sqls.userFuncDelete, {user_id: sub_user_id})

      for (let funcId of checked) {
        yield Query.call(connection, sqls.userFuncCreate, {
          id: uuidv4(),
          user_id: sub_user_id,
          func_id: funcId,
          use_yn: 'Y',
          create_user_id: user_id
        })
      }

      yield Commit.call(connection)

      res.json({success: true})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return connection
  }).then((connection) => {
    return co(function* () {
      let from_table = 't_user_func',
        from_table_key = sub_user_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = user_id,
        create_sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改用户菜单权限表 修改内容：变更子用户菜单权限：${sub_user_id}`

      yield [
        writeOperLog(connection, {
          from_table,
          from_table_key,
          from_org_code,
          create_user_id,
          sub_user_id: create_sub_user_id,
          oper_log
        }),
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
  }).then(() => {
    connection && connection.release();
  });
});


router.post('/roleSearch', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let body = req.body,
      myPageIndex = (isNaN(body.pageIndex) || (body.pageIndex < 1)) ? 0 : 10 * (body.pageIndex - 1),
      params = getMySQLFieldValue(Object.assign({}, body, {pageIndex: myPageIndex}));
      params.role_type = req.session.profile.user_type;
    let [[rows]] = yield [
      Query.call(connection, sqls.subUserRoleManageQuery, params)
    ]
    if (rows.length< 1) {
      throw new Error("无记录")
    }
    res.json({success: true, rows, total: rows.length})
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
