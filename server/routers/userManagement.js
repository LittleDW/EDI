var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, uuidv4, getMySQLFieldValue, propertyChangeLogger, operLogDictionaryGenerator} = require("../util"),
  router = Router();

/**
 * 作者：石奇峰，马博晓
 * 模块：主账号管理页面
 * */
router.use((req, res, next) => {
  if(!req.session._submenu.includes("user_management")){
    res.json({success:false, message:"您没有调用用户信息页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let body = req.body,
      myPageIndex = (isNaN(body.pageIndex) || (body.pageIndex < 1)) ? 0 : 10 * (body.pageIndex - 1),
      params = getMySQLFieldValue(Object.assign({}, body, {pageIndex: myPageIndex}))
    let [[countRows], [rows]] = yield [
      Query.call(connection, sqls.userManageCount, params),
      Query.call(connection, sqls.userManageQuery, params)
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
router.post('/update', (req, res, next) => {
  if(!req.session._button.includes("user_management_auth")){
    next();
    return
  }
  let connection, {user_type, org_code, user_account, user_name, user_full_name, rop_user_id, user_id} = req.body,
    params = getMySQLFieldValue(Object.assign({}, req.body, {
      password: req.body.new_password ? req.body.new_password.md5() : '',
    })), old_value
  co(function* () {
    if(!user_type){
      throw new Error("用户类型不能为空")
    } if(!org_code){
      throw new Error("机构编码不能为空")
    } else if(!user_account){
      throw new Error("用户账号不能为空")
    } else if(!user_name){
      throw new Error("机构名不能为空")
    } else if(!user_full_name){
      throw new Error("机构名全称不能为空")
    } else if (org_code && !/^(F1502\d{3}||A1501\d{3}||O1503\d{3}||X1504\d{3}||F1506\d{3}||A1505\d{3})$/.test(org_code)) {
      throw new Error("非法的机构编码");
    } else if (rop_user_id && !/^[0-9A-Z]{8}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{12}$/.test(rop_user_id)) {
      throw new Error("非法的ROP用户编码");
    }

    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});

    let [preQueryRows] = yield Query.call(connection, sqls.userQuery, params)
    if (!preQueryRows || !preQueryRows[0]) {
      throw new Error("查无此用户")
    }
    let [countRows] = yield Query.call(connection, sqls.userManageUpdatePreCount, params)
    if (countRows[0] && (countRows[0].total > 0)) {
      throw new Error("用户已存在，请改变账号名，机构编码或者ROP用户编码")
    }
    try {
      yield  Transaction.call(connection)

      old_value = preQueryRows[0]
      let [[results], [userAttributeResult], [dicResults]] = yield [
        Query.call(connection, sqls.userManageUpdate, params),
        (preQueryRows[0].org_code != org_code) ? Query.call(connection, sqls.UserAttributeUpdate, params): Promise.resolve([]),
        (preQueryRows[0].org_code != org_code) || (preQueryRows[0].user_name != user_name) ? Query.call(connection, sqls.dictionaryUpdate, {
          table_name: "t_user",
          col_name: "org_code",
          para_key: org_code,
          para_value: user_name,
          old_table_name: "t_user",
          old_col_name: "org_code",
          old_para_key: preQueryRows[0].org_code,
          old_para_value: preQueryRows[0].user_name,
        }) : Promise.resolve([])
      ]
      if (results.affectedRows < 1) {
        throw new Error("用户修改失败")
      }
      if (userAttributeResult && (userAttributeResult.affectedRows < 1)) {
        throw new Error("用户平台属性修改失败")
      }
      if (dicResults && (dicResults.affectedRows < 1)) {
        throw new Error("字典修改失败")
      }
      yield Commit.call(connection)

      let [rows] = yield Query.call(connection, sqls.userQuery, {user_id})
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
      params = operLogDictionaryGenerator('t_repayment', ['user_status'], params);
      old_value = operLogDictionaryGenerator('t_repayment', ['user_status'], old_value);
      let from_table = 't_user',
        logger = propertyChangeLogger(old_value, [
          {name: 'user_type', label: '用户类型'},
          {name: 'org_code', label: '机构编码'},
          {name: 'user_status', label: '用户状态'},
          {name: 'user_account', label: '用户账号'},
          {name: 'password', label: '用户密码'},
          {name: 'user_name', label: '机构名'},
          {name: 'rop_user_id', label: 'ROP平台编码'},
          {name: 'tel', label: '用户电话'},
          {name: 'mobile', label: '用户手机'},
          {name: 'email', label: '用户邮箱'}
        ], params),
        from_table_key = user_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改用户表 修改内容：修改用户：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

      let from_dic_table = 't_sys_para_info',
        from_dic_table_key = `org_code,${params.user_name},${params.org_code},t_user`,
        from_dic_org_code = req.session.profile.org_code,
        create_dic_user_id = req.session.profile.user_id,
        create_dic_sub_user_id = req.session.profile.sub_user_id;

      let oper_dic_log = `动作：修改字典表 修改内容：增加词条：${from_dic_table_key}`
      yield [
        writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log}),
        writeOperLog(connection, {
          from_table: from_dic_table,
          from_table_key: from_dic_table_key,
          from_org_code: from_dic_org_code,
          create_user_id: create_dic_user_id,
          sub_user_id: create_dic_sub_user_id,
          oper_log: oper_dic_log
        })
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
  if(!req.session._button.includes("user_management_create")){
    next();
    return
  }
  let connection, {org_code, user_account,new_password,user_name, user_full_name, rop_user_id, user_type} = req.body, user_id = uuidv4(),
    params = getMySQLFieldValue(Object.assign({}, req.body, {
      user_id,
      password: req.body.new_password ? req.body.new_password.md5() : '',
    }))
  co(function* () {
    if(!user_type){
      throw new Error("用户类型不能为空")
    } if(!org_code){
      throw new Error("机构编码不能为空")
    } else if(!user_account){
      throw new Error("用户账号不能为空")
    } else if(!user_name){
      throw new Error("机构名不能为空")
    } else if(!user_full_name){
      throw new Error("机构名全称不能为空")
    } else if(!new_password){
      throw new Error("新密码不能为空")
    } else if (org_code && !/^(F1502\d{3}||A1501\d{3}||O1503\d{3}||X1504\d{3})$/.test(org_code)) {
      throw new Error("非法的机构编码");
    } else if (rop_user_id && !/^[0-9A-Z]{8}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{12}$/.test(rop_user_id)) {
      throw new Error("非法的ROP用户编码");
    }

    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)
      let [countRows] = yield Query.call(connection, sqls.userManagePreCount, params)
      if (countRows[0] && (countRows[0].total > 0)) {
        throw new Error("用户已存在，请改变账号名，机构编码或者ROP用户编码")
      }
      let [[results], [dicResults]] = yield [
        Query.call(connection, sqls.userManageCreate, params),
        Query.call(connection, sqls.dictionaryCreate, {
          table_name: "t_user",
          col_name: "org_code",
          para_key: org_code,
          para_value: user_name
        })
      ]
      if (results.affectedRows < 1) {
        throw new Error("用户添加失败")
      }
      if (dicResults.affectedRows < 1) {
        throw new Error("字典添加失败")
      }

      // 添加到默认角色中
      let [roleRows] = yield Query.call(connection, sqls.systemRoleQuery, {role_type: user_type})
      if (roleRows && roleRows[0]) {
        yield Query.call(connection, sqls.roleManageUserAdd, {
          id: uuidv4(),
          role_id: roleRows[0].role_id,
          user_id: user_id,
          create_user_id: req.session.profile.user_id
        })
        yield Query.call(connection, sqls.UserAttributeAdd, {})
      }

      yield Commit.call(connection)

      /*let [[newCountRows], [rows]] = yield [
        Query.call(connection, sqls.userManageCount,{}),
        Query.call(connection, sqls.userManageQuery, {page_index: 0})
      ]
      if (!newCountRows || !newCountRows[0] || (newCountRows[0].total < 1)) {
        throw new Error("已创建，但查找失败")
      }
      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }*/
      res.json({success: true,})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return connection
  }).then((connection) => {
    return co(function* () {
      params = operLogDictionaryGenerator('t_repayment', ['user_status'], params);
      let from_table = 't_user',
        logger = propertyChangeLogger({},[
          {name: 'user_id', label: '用户ID'},
          {name: 'user_type', label: '用户类型'},
          {name: 'org_code', label: '机构编码'},
          {name: 'user_status', label: '用户状态'},
          {name: 'user_account', label: '用户账号'},
          {name: 'password', label: '用户密码'},
          {name: 'user_name', label: '机构名'},
          {name: 'rop_user_id', label: 'ROP平台编码'},
          {name: 'tel', label: '用户电话'},
          {name: 'mobile', label: '用户手机'},
          {name: 'email', label: '用户邮箱'},
        ], params),
        from_table_key = user_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改用户表 修改内容：添加用户：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

      let from_dic_table = 't_sys_para_info',
        from_dic_table_key = `org_code,${params.user_name},${params.org_code},t_user`,
        from_dic_org_code = req.session.profile.org_code,
        create_dic_user_id = req.session.profile.user_id,
        create_dic_sub_user_id = req.session.profile.sub_user_id;
      let oper_dic_log = `动作：修改字典表 修改内容：增加词条：${from_dic_table_key}`
      yield [
        writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log}),
        writeOperLog(connection, {
          from_table: from_dic_table,
          from_table_key: from_dic_table_key,
          from_org_code: from_dic_org_code,
          create_user_id: create_dic_user_id,
          sub_user_id: create_dic_sub_user_id,
          oper_log: oper_dic_log
        })
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
  if(!req.session._button.includes("user_management_delete")){
    next();
    return
  }
  let connection, params = getMySQLFieldValue(req.body)
  co(function* () {
    if(!params.user_id){
      throw new Error("用户ID不能为空")
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true}),
      old_value;
    try {
      yield  Transaction.call(connection)
      let [queryResults] = yield Query.call(connection, sqls.userQuery, params)
      if (!queryResults[0]) {
        throw new Error("用户已不存在，请重新核对")
      }
      old_value = queryResults[0]
      let [dicResults] = yield Query.call(connection, sqls.dictionaryDelete, {
        table_name: "t_user",
        col_name: "org_code",
        para_key: queryResults[0].org_code,
        para_value: queryResults[0].user_name
      })
      if (dicResults.affectedRows < 1) {
        throw new Error("字典删除失败")
      }
      let [[results],[attributeResults]] = yield [
        Query.call(connection, sqls.userManageDelete, params),
        Query.call(connection, sqls.UserAttributeDelete, params),
      ]
      if (results.affectedRows < 1) {
        throw new Error("用户删除失败")
      }
      if (attributeResults.affectedRows < 1) {
        throw new Error("用户平台属性删除失败")
      }
      yield Commit.call(connection)

     /* let [[countRows], [rows]] = yield [
        Query.call(connection, sqls.userManageCount, params),
        Query.call(connection, sqls.userManageQuery, {page_index: 0})
      ]
      if (!countRows || !countRows[0] || (countRows[0].total < 1)) {
        throw new Error("已删除，但查找失败")
      }
      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }*/
      res.json({success: true, /*rows, total: countRows[0].total*/})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).then(({connection, old_value}) => {
    return co(function* () {
      let from_table = 't_user',
        from_table_key = old_value.user_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改用户表 修改内容：删除用户：${old_value.user_id}, 用户名 ${old_value.user_name}`

      let from_dic_table = 't_sys_para_info',
        from_dic_table_key = `org_code,${old_value.user_name},${old_value.org_code},t_user`,
        from_dic_org_code = req.session.profile.org_code,
        create_dic_user_id = req.session.profile.user_id,
        create_dic_sub_user_id = req.session.profile.sub_user_id;
      let oper_dic_log = `动作：修改字典表 修改内容：删除词条：${from_dic_table_key}`
      yield [
        writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log}),
        writeOperLog(connection, {
          from_table: from_dic_table,
          from_table_key: from_dic_table_key,
          from_org_code: from_dic_org_code,
          create_user_id: create_dic_user_id,
          sub_user_id: create_dic_sub_user_id,
          oper_log: oper_dic_log
        })
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
  let connection, {user_id, user_type} = req.body
  co(function* () {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});

    let [roleRows] = yield Query.call(connection, sqls.systemRoleQuery, {role_type: user_type})
    if (!roleRows || !roleRows[0]) {
      throw new Error("没有对应系统角色")
    }
    let role_id = roleRows[0].role_id
    let [[roleFuncMain], [roleFuncSub], [userFunc]] = yield [
      Query.call(connection, sqls.roleManageFuncMainSearch, {role_id: role_id, role_type: user_type}),
      Query.call(connection, sqls.roleManageFuncSubSearch, {role_id: role_id}),
      Query.call(connection, sqls.userFuncQuery, {user_id: user_id})
    ]
    if (!roleFuncMain || !roleFuncMain[0]) {
      throw new Error("无记录")
    }

    let menus = new Array();
    let checked = new Array();
    let expanded = new Set();

    for (let row of roleFuncMain) {
      let leaf = new Object();
      leaf.value = row.func_id;
      leaf.label = row.func_name;
      leaf.icon = row.func_img;
      leaf.children = [];
      expanded.add(row.func_id);
      let rows_two = roleFuncSub.filter(r => (r.func_level == '1' && r.f_func_id == row.func_id))

      for (let row_two of rows_two) {
        let leaf_two = new Object();
        leaf_two.value = row_two.func_id;
        leaf_two.label = row_two.func_name;
        leaf_two.children = [];
        expanded.add(row_two.func_id);

        let rows_three = roleFuncSub.filter(r => (r.func_level == '2' && r.f_func_id == row_two.func_id))

        for (let row_three of rows_three) {
          let leaf_three = new Object();
          leaf_three.value = row_three.func_id;
          leaf_three.label = row_three.func_name;
          leaf_three.children = [];
          expanded.add(row_three.func_id);
          leaf_two.children.push(leaf_three);
        }
        leaf.children.push(leaf_two);
      }

      menus.push(leaf);
    }

    for (let row of userFunc) {
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
  if(!req.session._button.includes("user_management_auth")){
    next();
    return
  }
  let connection, user_id = req.body.user_id, create_user_id = req.session.profile.user_id,
    checked = req.body.checked
  co(function* () {
    if(!user_id){
      throw new Error("用户ID不能为空")
    } else if (!checked){
      throw new Error("用户权限不能为空")
    }
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true})
    try {
      yield  Transaction.call(connection)

      yield Query.call(connection, sqls.userFuncDelete, {user_id: user_id})

      for (let funcId of checked) {
        yield Query.call(connection, sqls.userFuncCreate, {
          id: uuidv4(),
          user_id: user_id,
          func_id: funcId,
          use_yn: 'Y',
          create_user_id: create_user_id
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
        from_table_key = user_id,
        from_org_code = req.session.profile.org_code,
        sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改用户菜单权限表 修改内容：变更用户菜单权限：${user_id}`

      yield [
        writeOperLog(connection, {from_table, from_table_key, from_org_code, create_user_id, sub_user_id, oper_log}),
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

module.exports = router
