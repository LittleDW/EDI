var {getConnectionQ, getWriteConnectionQ, writeOperLog} = require('../pool'), sqls = require("../../config/sqls.json"),
  {logger, promisify, co, Router, uuidv4, getMySQLFieldValue, propertyChangeLogger, operLogDictionaryGenerator} = require("../util"),
  router = Router();

/**
 * 作者：张宝玉
 * 模块：角色管理
 * */

router.use((req, res, next) => {
  if(!req.session._submenu.includes("role_management") && !req.session._submenu.includes('sub_user_management')){
    res.json({success:false, message:"您没有调用角色管理页面接口的权限"})
    return
  }
  next();
})

router.post('/search', (req, res, next) => {
  let connection
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let body = req.body,
      myPageIndex = (isNaN(body.pageIndex) || (body.pageIndex < 1)) ? 0 : 10 * (body.pageIndex - 1),
      params = getMySQLFieldValue(Object.assign({}, body, {pageIndex: myPageIndex}))
    let [[countRows], [rows]] = yield [
      Query.call(connection, sqls.roleManageCount, params),
      Query.call(connection, sqls.roleManageQuery, params)
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
  if(!req.session._button.includes("role_management_create")){
    next();
    return
  }

  let connection, role_id = uuidv4(), user_id = req.session.profile.user_id,
    params = getMySQLFieldValue(Object.assign({}, req.body, {
      role_id: role_id,
      create_user_id: user_id,
    }))
  co(function*() {

    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true});
    try {
      yield  Transaction.call(connection)
      let [countRows] = yield Query.call(connection, sqls.roleManagePreCount, params)
      if (countRows[0] && (countRows[0].total > 0)) {
        throw new Error(`角色名称重复，请重新输入`)
      }
      let [[results]] = yield [
        Query.call(connection, sqls.roleManageCreate, params),
      ]
      if (results.affectedRows < 1) {
        throw new Error("用户添加失败")
      }
      yield Commit.call(connection)

      let [[newCountRows], [rows]] = yield [
        Query.call(connection, sqls.roleManageCount, {role_name:"%"}),
        Query.call(connection, sqls.roleManageQuery, {page_index: 0,  role_name:"%"})
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
    return connection
  }).then((connection) => {
    return co(function*() {
      params = operLogDictionaryGenerator('t_role', ['role_type'], params);
      let from_table = 't_role',
        logger = propertyChangeLogger({}, [
          {name: 'role_id', label: '角色ID'},
          {name: 'role_name', label: '角色名称'},
          {name: 'role_type', label: '角色类型'},
          {name: 'remark', label: '备注'}
        ], params),
        from_table_key = role_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = user_id,
        create_sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改角色表 修改内容：添加角色：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

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
  if(!req.session._button.includes("role_management_update")){
    next();
    return
  }

  let connection, {role_code,role_name,role_type,remark,role_id} = req.body,
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

      let [preQueryRows] = yield Query.call(connection, sqls.roleQuery, params)
      if (!preQueryRows || !preQueryRows[0]) {
        throw new Error("角色不存在")
      }
      old_value = preQueryRows[0]

      let [checkRows] = yield Query.call(connection, sqls.roleManageCheckCount, params)
      if (checkRows[0] && (checkRows[0].total > 0)) {
        throw new Error("角色名称重复，请重新输入")
      }

      let [[results]] = yield [
        Query.call(connection, sqls.roleManageUpdate, params)
      ]
      if (results.affectedRows < 1) {
        throw new Error("角色修改失败")
      }
      yield Commit.call(connection)

      let [rows] = yield Query.call(connection, sqls.roleQuery, {role_id})
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
      params = operLogDictionaryGenerator('t_role', ['role_type'], params);
      old_value = operLogDictionaryGenerator('t_role', ['role_type'], old_value);
      let from_table = 't_role',
        logger = propertyChangeLogger(old_value, [
          {name: 'role_name', label: '角色名称'},
          {name: 'role_type', label: '角色类型'},
          {name: 'remark', label: '备注'}
        ], params),
        from_table_key = role_id,
        from_org_code = req.session.profile.org_code,
        create_user_id = req.session.profile.user_id,
        create_sub_user_id = req.session.profile.sub_user_id;
      let oper_log = `动作：修改角色表 修改内容：修改角色：${[].concat.apply([], logger.map(r => r.log ? [r.log] : [])).join(",")}`

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
  if(!req.session._button.includes("role_management_delete")){
    next();
    return
  }
  let connection, {role_id} = req.body, user_id = req.session.profile.user_id,
    params = getMySQLFieldValue(req.body, {
      role_id: role_id,
    }), old_value
  co(function*() {
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true})
    try {
      yield  Transaction.call(connection)
      let [queryResults] = yield Query.call(connection, sqls.roleQuery, params)
      if (!queryResults[0]) {
        throw new Error("角色不存在，请重新核对")
      }
      old_value = queryResults[0]

      let [results, funcResults, userResult] = yield [Query.call(connection, sqls.roleManageDelete, {role_id}),Query.call(connection, sqls.roleManageFuncDelete, {role_id}), Query.call(connection, sqls.roleManageUserDelete, {role_id})]
      if (results.affectedRows < 1) {
        throw new Error("角色删除失败")
      }
      yield Commit.call(connection)

      let [[countRows], [rows]] = yield [
        Query.call(connection, sqls.roleManageCount, {role_name:"%"}),
        Query.call(connection, sqls.roleManageQuery, {page_index: 0,  role_name:"%"})
      ]
      if (!countRows || !countRows[0] || (countRows[0].total < 1)) {
        throw new Error("已删除，但查找失败")
      }
      if (!rows || !rows[0]) {
        throw new Error("无记录")
      }
      res.json({success: true, rows, total: countRows[0].total})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return {connection, old_value}
  }).catch((err) => {
    res.json({
      success: false,
      message: err.message || "更新失败"
    });
  }).then(()=>{
    connection && connection.release();
  });
});

router.post('/funcSearch', (req, res, next) => {
  let connection, {role_id, role_type} = req.body
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let [[roleFuncMain], [roleFuncSub]] = yield [
      Query.call(connection, sqls.roleManageFuncMainSearch, {role_id: role_id,role_type:role_type}),
      Query.call(connection, sqls.roleManageFuncSubSearch, {role_id: role_id})
    ]
    if (!roleFuncMain || !roleFuncMain[0]) {
      throw new Error("无记录")
    }



    let menus = new Array();
    let checked = new Array();
    let expanded = new Set();

    for (let row of roleFuncMain) {
      let funcId = row.func_id;
      let funcName = row.func_name;
      let fFuncId = row.f_func_id;
      let leaf = new Object();
      leaf.value = row.func_id;
      leaf.label = row.func_name;
      leaf.icon = row.func_img;
      leaf.children = [];
      expanded.add(row.func_id);

      if(row.func_check=='1'){
        checked.push(row.func_id);
      }

      let rows_two = roleFuncSub.filter(r => (r.func_level == '1' && r.f_func_id == row.func_id))

      for (let row_two of rows_two) {
        let leaf_two = new Object();
        leaf_two.value = row_two.func_id;
        leaf_two.label = row_two.func_name;
        leaf_two.children = [];
        expanded.add(row_two.func_id);
        if(row_two.func_check=='1'){
          checked.push(row_two.func_id);
        }

        let rows_three = roleFuncSub.filter(r => (r.func_level == '2' && r.f_func_id == row_two.func_id))

        for (let row_three of rows_three) {
          let leaf_three = new Object();
          leaf_three.value = row_three.func_id;
          leaf_three.label = row_three.func_name;
          leaf_three.children = [];
          expanded.add(row_three.func_id);
          if(row_three.func_check=='1'){
            checked.push(row_three.func_id);
          }

          leaf_two.children.push(leaf_three);
        }
        leaf.children.push(leaf_two);
      }

      menus.push(leaf);
    }


    res.json({success: true, menus: menus, checked: checked, expanded: Array.from(expanded)})
    return connection
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(()=>{
    connection && connection.release();
  });
});

router.post('/funcUpdate', (req, res, next) => {
  if(!req.session._button.includes("role_management_func")){
    next();
    return
  }

  let connection, role_id = req.body.role_id, user_id = req.session.profile.user_id,
    checked = req.body.checked
  co(function*() {
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true})
    try {
      yield  Transaction.call(connection)

      yield Query.call(connection, sqls.roleManageFuncDelete, {role_id: role_id})

      for (let funcId of checked) {
        yield Query.call(connection, sqls.roleManageFuncCreate, {id: uuidv4(), role_id: role_id, func_id: funcId, use_yn: 'Y', create_user_id: user_id})
      }

      yield Commit.call(connection)

      res.json({success: true})

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return connection
  }).catch((err) => {
    res.json({
      success: false,
      message: err.message || "更新失败"
    });
  }).then(()=>{
    connection && connection.release();
  });
});

router.post('/userSearch', (req, res, next) => {
  let connection,{searchType} = req.body,
    params = getMySQLFieldValue(Object.assign({}, req.body, {

    }))
  co(function*() {
    connection = yield getConnectionQ(req)
    let Query = promisify(connection.query, {multiArgs: true});
    let [[roleFuncUserRows]] = yield [
      Query.call(connection,searchType=='1' ? sqls.roleManageUserSearch : sqls.roleManageUserAddSearch, params)
    ]
    // if (!roleFuncUserRows || !roleFuncUserRows[0]) {
    //   throw new Error("无记录")
    // }

    res.json({success: true, "userRows":roleFuncUserRows})
    return roleFuncUserRows
  }).catch(function (err) {
    res.json({
      success: false,
      message: err.message || "查询失败"
    });
  }).then(()=>{
    connection && connection.release();
  });
});

router.post('/userAdd', (req, res, next) => {
  if(!req.session._button.includes("role_management_user")){
    next();
    return
  }
  let connection, role_id = req.body.role_id,user_list = req.body.user_list, id = uuidv4(),create_user_id = req.session.profile.user_id,
    params = getMySQLFieldValue(Object.assign({}, req.body, {
      role_id: role_id,
    }))
  co(function*() {
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true})
    try {
      let addList = []
      for (let user_id of user_list) {
        addList.push(Query.call(connection, sqls.roleManageUserAdd, {id:uuidv4(), role_id: role_id, user_id: user_id,create_user_id:create_user_id}))
      }

      let [...addResultList] = yield addList


      let [[roleFuncUserRows]] = yield [
        Query.call(connection,sqls.roleManageUserAddSearch, params)
      ]
      Commit.call(connection)
      res.json({success: true, "userRows":roleFuncUserRows})
      return roleFuncUserRows

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "创建失败")
    }
    return connection
  }).catch((err) => {
    res.json({
      success: false,
      message: err.message || "创建失败"
    });
  }).then(()=>{
    connection && connection.release();
  });


});

router.post('/userDelete', (req, res, next) => {
  if(!req.session._button.includes("role_management_user")){
    next();
    return
  }
  let connection, role_id = req.body.role_id,user_list = req.body.user_list,
    params = getMySQLFieldValue(Object.assign({}, req.body, {
      role_id: role_id,
    }))
  co(function*() {
    connection = yield getWriteConnectionQ(req)
    let Transaction = promisify(connection.beginTransaction),
      Commit = promisify(connection.commit),
      RollBack = promisify(connection.rollback),
      Query = promisify(connection.query, {multiArgs: true})
    try {
      yield  Transaction.call(connection)

      for (let user_id of user_list) {
        yield Query.call(connection, sqls.roleManageUserDelete, { role_id: role_id, user_id: user_id})
      }

      yield Commit.call(connection)

      let [[roleFuncUserRows]] = yield [
        Query.call(connection,sqls.roleManageUserSearch, params)
      ]
      res.json({success: true, "userRows":roleFuncUserRows})
      return roleFuncUserRows

    } catch (e) {
      yield RollBack.call(connection)
      throw new Error(e.message || "更新失败")
    }
    return connection
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
