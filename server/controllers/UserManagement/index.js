/*
 * @Author zhangjunjie
 * @File index.js
 * @Created Date 2018-05-10 16-32
 * @Last Modified: 2018-05-10 16-32
 * @Modified By: zhangjunjie
 */

const userMService = require("../../services").business.userManagement;
const {getMySQLFieldValue,} = require('../../util');

const search = async (req, res) => {
  const { rows, total } = await userMService.search(req);
  return res.json({ success: true, rows, total });
};

const update = async (req, res) => {
  const data = await userMService.update(req);
  return res.json({ success: true, data });
};

const create = async (req, res) => {
  await userMService.create(req);
  return res.json({ success: true });
};

const deleteFun = async (req, res) => {
  await userMService.delete(req);
  return res.json({ success: true });
};

const authSearch = async (req, res) => {
  const { menus, checked, expanded } = await userMService.authSearch(req);
  return res.json({ success: true, menus, checked, expanded });
};

const auth = async (req, res) => {
  await userMService.auth(req);
  return res.json({ success: true });
};

const userAttributeFind = async (req, res) => {
  const data = await userMService.userAttributeFind(getMySQLFieldValue(req.body),req);
  return res.json({ success: true, data});
};
const userAttributeUpdate = async (req, res) => {
  await userMService.userAttributeUpdate(getMySQLFieldValue(req.body),req);
  return res.json({ success: true });
};

module.exports = {
  search,
  update,
  create,
  delete: deleteFun,
  authSearch,
  auth,
  userAttributeFind,
  userAttributeUpdate,
};
