/*
 * @Author Osborn
 * @File index.js
 * @Date 2018-04-17 11-29
 */

const Dao = require('./cooperatorApiFundDao');

const cooperatorApiFundQueryAndCount = (req, params) => {
  const dao = Dao(req);
  return dao.queryAndCount(params);
};
const cooperatorApiFundCheck = (req, params) => {
  const dao = Dao(req);
  return dao.check(params);
};
const cooperatorApiFundCreate = (req, params) => {
  const dao = Dao(req);
  return dao.create(params);
};
const cooperatorApiFundUpdate = (req, params) => {
  const dao = Dao(req);
  return dao.update(params);
}
const cooperatorApiFundDelete = (req, params) => {
  const dao =Dao(req);
  return dao.remove(params);
}

module.exports = {
  cooperatorApiFundQueryAndCount,
  cooperatorApiFundCheck,
  cooperatorApiFundCreate,
  cooperatorApiFundUpdate,
  cooperatorApiFundDelete,
};
