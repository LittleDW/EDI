/*
 * @Author Osborn
 * @File menuDao.js
 * @Created Date 2018-04-18 16-06
 * @Last Modified: 2018-04-18 16-06
 * @Modified By: Osborn
 */

const { Op } = require('sequelize');

const Super = require('../super');
const dao = require('../../../dao');

const { Common: commonDao, Role, User } = dao;

class Menu extends Super {
  queryAllMenu() {
    return Role.Func(this.info).queryAllMenu();
  }
  detail(params = {}) {
    return Role.Func(this.info).nativeQuerySingle(params);
  }
  maxSearch(params = {}) {
    return Role.Func(this.info).queryMaxMenu(params);
  }
  create(params = {}) {
    return Role.Func(this.info).nativeCreate(params);
  }
  update(values = {}, options = {}) {
    return Role.Func(this.info).nativeUpdate(values, { where: options });
  }
  queryChild(params = {}) {
    return Role.Func(this.info).queryChildMenu(params);
  }

  closestUpMenuSearch(params = {}) {
    const { f_func_id, sort_id } = params;
    return Role.Func(this.info).queryClosestUpMenu({ f_func_id, sort_id });
  }
  closestDownMenuSearch(params = {}) {
    const { f_func_id, sort_id } = params;
    return Role.Func(this.info).queryClosestDownMenu({ f_func_id, sort_id });
  }
  updateMenuSort(params = {}, t) {
    const { func_id, sort_id } = params;
    return Role.Func(this.info).nativeUpdate(
      { sort_id },
      { where: { func_id }, transaction: t, hooks: false },
    );
  }
  menuManageDeleteWithChildren(params = {}, t) {
    const { deletionIds } = params;
    return Role.Func(this.info).nativeDelete({
      where: { func_id: { [Op.in]: deletionIds } },
      hooks: false,
      transaction: t,
    });
  }

  roleMenuManageDeleteWithChildren(params = {}, t) {
    const { deletionIds } = params;
    return Role.RoleFunc(this.info).nativeDelete({
      where: { func_id: { [Op.in]: deletionIds } },
      hooks: false,
      transaction: t,
    });
  }

  userMenuManageDeleteWithChildren(params = {}, t) {
    const { deletionIds } = params;
    return User.UserFunc(this.info).nativeDelete({
      where: { func_id: { [Op.in]: deletionIds } },
      hooks: false,
      transaction: t,
    });
  }
}
module.exports = req => new Menu(req);
