/*
 * @Author zhangjunjie
 * @File index.js
 * @Created Date 2018-05-17 15-10
 * @Last Modified: 2018-05-17 15-12
 * @Modified By: zhangjunjie
 */

const afterRepaymentStatisticsService = require("../../services").business
  .afterRepaymentStatistics;

const search = async (req, res) => {
  const { monthList, dayList } = await afterRepaymentStatisticsService.search(
    req
  );
  return res.json({ success: true, monthList, dayList });
};

module.exports = {
  search
};
