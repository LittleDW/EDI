/*
 * @Author zhangjunjie
 * @File index.js
 * @Created Date 2018-05-22 15-16
 * @Last Modified: 2018-05-28 13-52
 * @Modified By: zhangjunjie
 */

const distriPlan = require('../../services').business.distriPlan;

const search = async (req, res) => {
  const { readOnly, data, deadlineData } = await distriPlan.search(req);
  return res.json({ success: true, readOnly, data, deadlineData });
};

const searchHis = async (req, res) => {
  const { total, hisList } = await distriPlan.searchHis(req);
  return res.json({ success: true, total, hisList });
};

const update = async (req, res) => {
  const { success } = await distriPlan.update(req);
  return res.json({ success });
};

module.exports = {
  search,
  searchHis,
  update,
};
