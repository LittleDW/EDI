/*
 * File index.js
 * File Created: 2018-05-22 Tuesday, 03:50:59
 * Author: zhangjunjie (zhangjunjie@rongcapital.cn)
 * -----
 * Last Modified: 2018-05-23 Wednesday, 04:27:31
 * Modified By: zhangjunjie (zhangjunjie@rongcapital.cn>)
 * -----
 */

const subuserMService = require("../../services").business.subuserManagement;

const search = async (req, res) => {
  const { rows, total } = await subuserMService.search(req);
  return res.json({ success: true, rows, total });
};

const getRestriction = async (req, res) => {
  const { rows, restrictionFlag } = await subuserMService.getRestriction(req);
  return res.json({ success: true, rows, restrictionFlag });
};

const updateRestriction = async (req, res) => {
  const { rows, total } = await subuserMService.updateRestriction(req);
  return res.json({ success: true, rows, total });
};

const update = async (req, res) => {
  const {data} = await subuserMService.update(req);
  return res.json({ success: true, data });
};

const create = async (req, res) => {
  await subuserMService.create(req);
  return res.json({ success: true});
};

const deleteFun = async (req, res) => {
  await subuserMService.deleteFun(req);
  return res.json({ success: true });
};

const authSearch = async (req, res) => {
  const {menus, checked, expanded} = await subuserMService.authSearch(req);
  return res.json({ success: true, menus, checked, expanded});
};

const auth = async (req, res) => {
  await subuserMService.auth(req);
  return res.json({ success: true});
}
const roleSearch = async (req, res) => {
  const {rows, total} = await subuserMService.roleSearch(req);
  return res.json({ success: true, rows, total});
}

module.exports = {
  search,
  getRestriction,
  updateRestriction,
  update,
  create,
  delete: deleteFun,
  authSearch,
  auth,
  roleSearch,
};
