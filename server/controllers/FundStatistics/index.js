/*
 * File index.js
 * File Created: 2018-04-12 15:08
 * Author: zhangjunjie (zhangjunjie@rongcapital.cn)
 * -----
 * Last Modified: 2018-05-22 Tuesday, 02:58:53
 * Modified By: zhangjunjie (zhangjunjie@rongcapital.cn>)
 * -----
 */


const fundStatistics = require("../../services/").business.fundStatistics;
const total = async (req, res) => {
  const { totalList } = await fundStatistics.total(req);
  return res.json({ success: true, totalList });
};

const fundOrAsset = async (req, res) => {
  const { orgDataList } = await fundStatistics.fundOrAsset(req);
  return res.json({ success: true, orgDataList });
};

const deadline = async (req, res) => {
  const { deadlineDataList } = await fundStatistics.deadline(req);
  return res.json({ success: true, deadlineDataList });
};

const platform = async (req, res) => {
  const { scaleList, collectList } = await fundStatistics.platform(req);
  return res.json({ success: true, platformList: {scaleList, collectList }});
};

module.exports = {
  total,
  fundOrAsset,
  deadline,
  platform,
};
