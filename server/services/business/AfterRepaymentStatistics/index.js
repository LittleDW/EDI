/*
 * @Author zhangjunjie
 * @File index.js
 * @Created Date 2018-05-17 15-14
 * @Last Modified: 2018-05-17 15-17
 * @Modified By: zhangjunjie
 */
const { getMySQLFieldValue } = require("../../../util");
const afterRSDao = require("./afterRepaymentStatisticsDao");

const search = async req => {
  const { year, month, assetOrgCode, fundOrgCode } = req.body;
  if (typeof year !== 'string' || year.length !== 4) {
    throw new Error('年份错误，请重新选择')
  }
  if (typeof month !== 'string' || month.length !== 2) {
    throw new Error('月份错误，请重新选择')
  }
  const { user_type, org_code } = req.session.profile;
  const params = getMySQLFieldValue({
    year,
    month,
    assetOrgCode: user_type === 1 ? org_code : assetOrgCode,
    fundOrgCode: user_type === 2 ? org_code : fundOrgCode
  });
  const bDao = afterRSDao(req);
  const [monthList, dayList] = await Promise.all([
    bDao.monthSearch(params),
    bDao.daySearch(params)
  ]);
  return { monthList, dayList };
};

module.exports = {
  search
};
