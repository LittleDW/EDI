/**
 * @author robin
 * @file index
 * @date 2018-04-26 11:35
 */
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const {bridgeService, service:{spawningService, pagingSpawningService}} = require('../Common');
const { sequelizeDB } = require('../../../schema');
const Dao = require('./roleDao');

const configure = require('../../../../config/configure')[process.env.NODE_ENV];
const ropAPI = require('../../../ropAPI');
const {promisifyInterval, promisifyPipingTempFile, thunkifyEvent, logger, uuidv4} = require('../../../util');

const search = async (params, req) => {
  const dao = Dao(req)
  let {rows, count:total} = await dao.pagingQuery(params)
  return {rows, total}
};
const create = async (params, req) => {
  const dao = Dao(req)
  let countRows = await dao.countRoleName(params)
  if (countRows) {
    throw new Error('角色名称重复，请重新输入')
  }
  await dao.create(params)
  let {rows, count:total} = await dao.pagingQuery({role_name:"%",page_index:0})

  return {rows,total}
};
const update = async (params, req) => {
  const dao = Dao(req)
  let countRows = await dao.countRoleID(params)
  if (!countRows) {
    throw new Error('角色不存在')
  }
  countRows = await dao.countRoleName(params)
  if (countRows) {
    throw new Error('角色名称重复，请重新输入')
  }
  let [affectedRows] = await dao.update(params)
  if(affectedRows<1){
    throw new Error('角色修改失败')
  }
  let data = await dao.find(params)
  return {data:data.dataValues}
};

const deleteService = async (params, req) => {
  const dao = Dao(req)
  let countRows = await dao.countRoleID(params)
  if (!countRows) {
    throw new Error('角色不存在')
  }
  let deletedCount = await dao.delete(params)
  if(deletedCount<1){
    throw new Error('角色删除失败')
  }
  let {rows, count:total} = await dao.pagingQuery({role_name:"%",page_index:0})
  return {rows,total}
};

const funcSearch = async (params, req) => {
  const dao = Dao(req)
  let [roleFuncMain, roleFuncSub] = await Promise.all([
    dao.funcMainSearch(params),dao.funcSubSearch(params)
  ])
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
  return {menus: menus, checked: checked, expanded: Array.from(expanded)}
};

const funcUpdate = async (params, req) => {
  const dao = Dao(req)
  const t = await sequelizeDB.transaction();
  let {checked=[],role_id} = params,user_id = req.session.profile.user_id;
  try {
    await dao.funcDelete(params)
    await Promise.all(checked.map(r=>dao.funcCreate({id: uuidv4(), role_id, func_id: r, use_yn: 'Y', create_user_id: user_id})))

    await t.commit();
  } catch (e) {
    logger.error(e);
    await t.rollback();
    return Promise.reject('更新失败');
  }
};
const userAdd = async (params, req) => {
  const dao = Dao(req)
  let {role_id, user_list=[]}= params,create_user_id = req.session.profile.user_id

  const t = await sequelizeDB.transaction();
  try {
    await Promise.all(user_list.map(r=>dao.userCreate({id:uuidv4(), role_id, user_id: r,create_user_id:create_user_id})))
    await t.commit();
  } catch (e) {
    logger.error(e);
    await t.rollback();
    return Promise.reject('更新失败');
  }

  let userRows = await dao.userSearch(params)
  return {userRows}
};

const userDelete = async (params, req) => {
  const dao = Dao(req)
  let {role_id, user_list=[]}= params
  const t = await sequelizeDB.transaction();
  try {
    await Promise.all(user_list.map(r=>dao.userDelete({ role_id, user_id: r})))
    await t.commit();
  } catch (e) {
    logger.error(e);
    await t.rollback();
    return Promise.reject('更新失败');
  }

  let userRows = await dao.roleUserSearch(params)
  return {userRows}
};

const userSearch = async (params, req) => {
  const dao = Dao(req)
  let {search_type} = params,userRows
  if(search_type == "1"){
    userRows = await dao.roleUserSearch(params)
  } else {
    userRows = await dao.userSearch(params)
  }
  return {userRows}
};

module.exports = bridgeService({
  search,
  create,
  update,
  deleteService,
  funcSearch,
  funcUpdate,
  userAdd,
  userDelete,
  userSearch,
}, Dao);
