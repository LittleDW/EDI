/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-04-18 16-06
 * @Last Modified: 2018-04-18 16-06
 * @Modified By: Osborn
 */

const _ = require('lodash');

const { sequelizeDB } = require('../../../schema');
const Dao = require('./menuDao');

const allMenusSearch = (req, params = {}) => {
  const dao = Dao(req);
  return dao.queryAllMenu();
};
const menuDetailSearch = (req, params = {}) => {
  const dao = Dao(req);
  const { func_id } = params;
  return dao.detail({ where: { func_id } });
};

const maxMenuSortIdSearch = (req, params = {}) => {
  const dao = Dao(req);
  const { f_func_id } = params;
  return dao.maxSearch({ f_func_id });
};

const menuManageCreate = (req, params = {}) => {
  const dao = Dao(req);
  const {
    func_id,
    f_func_id,
    func_name,
    func_desc,
    func_path,
    page_id,
    func_level,
    func_type,
    func_role_type,
    func_img,
    sort_id,
    use_yn,
    remark,
    create_user_id,
  } = params;
  return dao.create({
    func_id,
    f_func_id,
    func_name,
    func_desc,
    func_path,
    page_id,
    func_level,
    func_type,
    func_role_type,
    func_img,
    sort_id,
    use_yn,
    remark,
    create_user_id,
  });
};

const menuManageUpdate = (req, params = {}) => {
  const dao = Dao(req);
  const {
    func_name, func_path, page_id, func_role_type, func_img,
  } = params;
  const { func_id } = params;
  return dao.update(
    {
      func_name,
      func_path,
      page_id,
      func_role_type,
      func_img,
    },
    { func_id },
  );
};

const allAndDetailSearch = (req, params = {}) => {
  const dao = Dao(req);
  const { func_id } = params;
  return Promise.all([dao.queryAllMenu(), dao.detail({ where: { func_id } })]);
};

const deleteWithCascade = async (req, params = {}) => {
  const dao = Dao(req);
  const { func_id } = params;
  const deletionIds = [func_id];
  const level1 = await dao.queryChild({ func_id });
  if (!_.isEmpty(level1)) {
    for (const l of level1) {
      const level1_func_id = l.func_id;
      deletionIds.push(level1_func_id);
      const level2 = await dao.queryChild({ func_id: level1_func_id });
      if (!_.isEmpty(level2)) {
        level2.map((l2) => {
          deletionIds.push(l2.func_id);
          return null;
        });
      }
    }
  }
  if (_.isEmpty(deletionIds)) {
    throw new Error('error');
  }
  const t = await sequelizeDB.transaction();
  try {
    await Promise.all([
      dao.menuManageDeleteWithChildren({ deletionIds }, t),
      dao.roleMenuManageDeleteWithChildren({ deletionIds }, t),
      dao.userMenuManageDeleteWithChildren({ deletionIds }, t),
    ]);
    await t.commit();
  } catch (e) {
    console.error(e);
    await t.rollback();
  }
};
const closestUpMenuSearch = (req, params) => {
  const dao = Dao(req);
  const { f_func_id, sort_id } = params;
  return dao.closestUpMenuSearch({ f_func_id, sort_id });
};
const closestDownMenuSearch = (req, params) => {
  const dao = Dao(req);
  const { f_func_id, sort_id } = params;
  return dao.closestDownMenuSearch({ f_func_id, sort_id });
};

const menuManageUpdateSortId = async (req, params) => {
  const dao = Dao(req);
  const { selectMenuParam, moveMenuParam } = params;
  const t = await sequelizeDB.transaction();
  try {
    const [[selectMenuAffectCount], [moveMenuAffectCount]] = await Promise.all([
      dao.updateMenuSort(selectMenuParam, t),
      dao.updateMenuSort(moveMenuParam, t),
    ]);
    await t.commit();
    return [selectMenuAffectCount, moveMenuAffectCount];
  } catch (e) {
    await t.rollback();
    return Promise.reject('菜单移动失败');
  }
};

module.exports = {
  allMenusSearch,
  menuDetailSearch,
  maxMenuSortIdSearch,
  menuManageCreate,
  menuManageUpdate,
  allAndDetailSearch,
  deleteWithCascade,
  closestUpMenuSearch,
  closestDownMenuSearch,
  menuManageUpdateSortId,
};
