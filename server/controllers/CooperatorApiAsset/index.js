/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-04-17 11-17
 */

const _ = require('lodash');

const { getMySQLFieldValue } = require('../../util');
const cooperatorApiAssetService = require('../../services').business.cooperatorApiAsset;

const search = async (req, res, next) => {
  const { pageIndex } = req.body;
  const myPageIndex = _.isNaN(pageIndex) || pageIndex < 1 ? 0 : 10 * (pageIndex - 1);
  const params = getMySQLFieldValue(Object.assign({}, req.body, { page_index: myPageIndex }));
  const { count, rows } = await cooperatorApiAssetService.cooperatorApiAssetQueryAndCount(
    req,
    params,
  );
  // if (count === 0) {
  //   throw new Error('无记录');
  // }
  return res.json({ success: true, rows: rows.map((r) => r.dataValues), total: count });
};

const create = async (req, res, next) => {
  const params = getMySQLFieldValue(Object.assign({}, req.body));
  const checkResultSet = await cooperatorApiAssetService.cooperatorApiAssetCheck(req, params);
  if (!_.isEmpty(checkResultSet)) {
    throw new Error('数据已经存在');
  }
  const resultSet = await cooperatorApiAssetService.cooperatorApiAssetCreate(req, params);
  if (_.isEmpty(resultSet)) {
    throw new Error('API地址维护失败');
  }
  const { count, rows } = await cooperatorApiAssetService.cooperatorApiAssetQueryAndCount(
    req,
    params,
  );
  if (count === 0) {
    throw new Error('已创建，但查找失败');
  }
  if (!rows || !rows[0]) {
    throw new Error('无记录');
  }
  return res.json({ success: true, rows, total: count });
};

const update = async (req, res, next) => {
  const params = getMySQLFieldValue(Object.assign({}, req.body));
  const [affectRows] = await cooperatorApiAssetService.cooperatorApiAssetUpdate(req, params);
  if (affectRows < 1) {
    throw new Error('API地址维护失败');
  }
  const resultSet = await cooperatorApiAssetService.cooperatorApiAssetCheck(req, params);
  if (_.isEmpty(resultSet)) {
    throw new Error('已更新但查无记录');
  }
  return res.json({ success: true, data: resultSet.dataValues });
};

const remove = async (req, res, next) => {
  const { asset_org_code, api_type } = req.body;
  const params = getMySQLFieldValue(req.body, {
    asset_org_code,
    api_type,
  });
  const deletionAffectRows = await cooperatorApiAssetService.cooperatorApiAssetDelete(req, params);
  if (deletionAffectRows < 1) {
    throw new Error('数据删除失败');
  }
  return res.json({ success: true });
};

module.exports = {
  search,
  create,
  update,
  remove,
};
