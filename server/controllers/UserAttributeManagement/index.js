/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-05-08 14-41
 * @Last Modified: 2018-05-08 14-41
 * @Modified By: Osborn
 */

const _ = require('lodash');

const userAttributeService = require('../../services').business.userAttribute;
const { getMySQLFieldValue } = require('../../util');

const search = async (req, res, next) => {
  const { pageIndex } = req.body;
  const myPageIndex =
    _.isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  const params = getMySQLFieldValue(
    Object.assign({}, req.body, { pageIndex: myPageIndex })
  );
  const [
    count,
    resultSet,
  ] = await userAttributeService.userAttributeManagementQueryAndCount(
    req,
    params
  );
  // if (count === 0) {
  //   throw new Error('无记录');
  // }
  return res.json({
    success: true,
    rows: resultSet.map(r => r.dataValues),
    total: count,
  });
};
module.exports = {
  search,
};
