/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-04-17 11-29
 */

const Dao = require('./cooperatorApiAssetDao');

const cooperatorApiAssetQueryAndCount = (req, params) => {
  const dao = Dao(req);
  return dao.queryAndCount(params);
};
const cooperatorApiAssetCheck = (req, params) => {
  const dao = Dao(req);
  return dao.check(params);
};
const cooperatorApiAssetCreate = (req, params) => {
  const dao = Dao(req);
  return dao.create(params);
};
const cooperatorApiAssetUpdate = (req, params) => {
  const dao = Dao(req);
  return dao.update(params);
}
const cooperatorApiAssetDelete = (req, params) => {
  const dao =Dao(req);
  return dao.remove(params);
}

module.exports = {
  cooperatorApiAssetQueryAndCount,
  cooperatorApiAssetCheck,
  cooperatorApiAssetCreate,
  cooperatorApiAssetUpdate,
  cooperatorApiAssetDelete,
};
