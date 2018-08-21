/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-04-18 16-04
 * @Last Modified: 2018-04-18 16-04
 * @Modified By: Osborn
 */

const _ = require('lodash');

const { makeTree, uuidv4, getMySQLFieldValue } = require('../../util');
const menuService = require('../../services').business.menu;
const commonService = require('../../services').business.businessCommon;

const search = async (req, res, next) => {
  const funcResultSet = await menuService.allMenusSearch(req);
  if (_.isEmpty(funcResultSet)) {
    throw new Error('无记录');
  }
  return res.json({ success: true, menus: makeTree(funcResultSet) });
};

const detail = async (req, res, next) => {
  const { func_id } = req.body;
  if (_.isEmpty(func_id)) {
    return res.json({ success: true, detail: {} });
  }
  const funcInst = await menuService.menuDetailSearch(req, { func_id });
  if (_.isEmpty(funcInst)) {
    throw new Error('无记录');
  }
  return res.json({ success: true, detail: funcInst.dataValues });
};

const create = async (req, res, next) => {
  const { f_func_id } = req.body;
  const func_id = uuidv4();
  const { user_id } = req.session.profile;
  const params = getMySQLFieldValue(Object.assign({}, req.body, {
    func_id,
    use_yn: 'Y',
    create_user_id: user_id,
  }));

  if (_.isEmpty(f_func_id)) {
    params.func_level = 0;
  } else {
    const funcInst = await menuService.menuDetailSearch(req, {
      func_id: f_func_id,
    });
    if (_.isEmpty(funcInst)) {
      throw new Error('父菜单已不存在，请重新查询');
    }
    params.func_level = funcInst.func_level + 1;
    params.func_role_type = 0;
  }
  const maxMenuInst = await menuService.maxMenuSortIdSearch(req, { f_func_id });
  if (_.isNumber(maxMenuInst.dataValues.max_sort_id)) {
    params.sort_id = maxMenuInst.dataValues.max_sort_id + 1;
  } else {
    params.sort_id = 0;
  }
  await menuService.menuManageCreate(req, params);
  const resultSet = await menuService.allMenusSearch(req);
  if (_.isEmpty(resultSet)) {
    throw new Error('无记录');
  }
  return res.json({ success: true, menus: makeTree(resultSet) });
};

const update = async (req, res, next) => {
  const { func_id } = req.body;
  const params = getMySQLFieldValue(Object.assign({}, req.body));
  await menuService.menuManageUpdate(req, params);
  const [resultSet, detailInst] = await menuService.allAndDetailSearch(req, {
    func_id,
  });
  if (_.isEmpty(detailInst)) {
    throw new Error('已更新但查无记录');
  }
  if (_.isEmpty(resultSet)) {
    throw new Error('无记录');
  }
  return res.json({
    success: true,
    menus: makeTree(resultSet),
    detail: detailInst.dataValues,
  });
};

const remove = async (req, res, next) => {
  const { func_id } = req.body;
  const detailInst = await menuService.menuDetailSearch(req, { func_id });
  if (_.isEmpty(detailInst)) {
    throw new Error('菜单已不存在, 请重新核对');
  }
  await menuService.deleteWithCascade(req, { func_id });
  const resultSet = await menuService.allMenusSearch(req);
  if (_.isEmpty(resultSet)) {
    throw new Error('无记录');
  }
  await commonService.manualLog(req, {
    from_table: 't_func',
    from_table_key: detailInst.func_id,
    oper_log: `修改菜单表 修改内容：删除菜单 ${detailInst.func_id}, 菜单名 ${
      detailInst.func_name
    }, 菜单路径 ${detailInst.func_path}`,
  });
  return res.json({ success: true, menus: makeTree(resultSet), detail: {} });
};

const up = async (req, res, next) => {
  const { func_id } = req.body;
  const detailInst = await menuService.menuDetailSearch(req, { func_id });
  if (_.isEmpty(detailInst)) {
    throw new Error('查无此记录');
  }
  const { f_func_id, sort_id } = detailInst.dataValues;
  const closestUpInst = await menuService.closestUpMenuSearch(req, {
    f_func_id,
    sort_id,
  });
  if (_.isEmpty(closestUpInst)) {
    throw new Error('已是最顶部菜单，不能上移');
  }
  const selectMenuParam = {
    func_id: detailInst.func_id,
    sort_id: closestUpInst.sort_id,
  };
  const moveMenuParam = {
    func_id: closestUpInst.func_id,
    sort_id: detailInst.sort_id,
  };
  const [selectMenuAffectCount, moveMenuAffectCount] = await menuService.menuManageUpdateSortId(
    req,
    {
      selectMenuParam,
      moveMenuParam,
    },
  );
  if (selectMenuAffectCount === 0 || moveMenuAffectCount === 0) {
    throw new Error('菜单上移失败');
  }
  const menuResultSet = await menuService.allMenusSearch(req);
  if (_.isEmpty(menuResultSet)) {
    throw new Error('无记录');
  }
  await commonService.manualLog(req, {
    from_table: 't_func',
    from_table_key: detailInst.func_id,
    oper_log: `修改菜单表 修改内容：上移菜单 ${detailInst.func_id}, 菜单名 ${
      detailInst.func_name
    }, 菜单路径 ${detailInst.func_path}`,
  });
  return res.json({ success: true, menus: makeTree(menuResultSet) });
};

const down = async (req, res, next) => {
  const { func_id } = req.body;
  const detailInst = await menuService.menuDetailSearch(req, { func_id });
  if (_.isEmpty(detailInst)) {
    throw new Error('查无此记录');
  }
  const { f_func_id, sort_id } = detailInst.dataValues;
  const closestUpInst = await menuService.closestDownMenuSearch(req, {
    f_func_id,
    sort_id,
  });
  if (_.isEmpty(closestUpInst)) {
    throw new Error('已是最底部菜单，不能下移');
  }
  const selectMenuParam = {
    func_id: detailInst.func_id,
    sort_id: closestUpInst.sort_id,
  };
  const moveMenuParam = {
    func_id: closestUpInst.func_id,
    sort_id: detailInst.sort_id,
  };
  const [selectMenuAffectCount, moveMenuAffectCount] = await menuService.menuManageUpdateSortId(
    req,
    {
      selectMenuParam,
      moveMenuParam,
    },
  );
  if (selectMenuAffectCount === 0 || moveMenuAffectCount === 0) {
    throw new Error('菜单上移失败');
  }
  const menuResultSet = await menuService.allMenusSearch(req);
  if (_.isEmpty(menuResultSet)) {
    throw new Error('无记录');
  }
  await commonService.manualLog(req, {
    from_table: 't_func',
    from_table_key: detailInst.func_id,
    oper_log: `修改菜单表 修改内容：下移菜单 ${detailInst.func_id}, 菜单名 ${
      detailInst.func_name
    }, 菜单路径 ${detailInst.func_path}`,
  });
  return res.json({ success: true, menus: makeTree(menuResultSet) });
};

module.exports = {
  search,
  detail,
  create,
  update,
  remove,
  up,
  down,
};
