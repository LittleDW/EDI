/*
 * @Author Osborn
 * @File index.js
 * @Created Date 2018-05-03 16-51
 * @Last Modified: 2018-05-03 16-51
 * @Modified By: Osborn
 */
const { Op } = require('sequelize');
const Dao = require('./userAttributeDao');

const userAttributeQuery = (req, params) => {
  const dao = Dao(req);
  const { user_id } = params;
  return dao.query({ user_id });
};
const UserAttributeUpdate = (req, params, t = null) => {
  const dao = Dao(req);
  const {
    partner_nature,
    is_debt_exchange,
    repayment_mode,
    is_deadline_favor,
    product_deadline,
    supervise_bank,
    org_code,
    user_id,
  } = params;
  return dao.update(
    {
      partner_nature,
      is_debt_exchange,
      repayment_mode,
      is_deadline_favor,
      product_deadline,
      supervise_bank,
      org_code,
    },
    { where: { user_id }, transaction: t },
  );
};

const UserAttributeFundApiUrlCheck = (req, params) => {
  const dao = Dao(req);
  const { fund_org_code } = params;
  const api_type = '04';
  return dao.apiCheck({ where: { fund_org_code, api_type } });
};

const UserAttributeFundApiUrlUpdate = (req, params, t) => {
  const dao = Dao(req);
  const api_type = '04';
  const { api_url } = params;
  const { fund_org_code } = params;
  return dao.apiUpdate({ api_url }, { where: { fund_org_code, api_type }, transaction: t });
};

const UserAttributeFundApiUrlCreate = (req, params, t = null) => {
  const dao = Dao(req);
  const api_type = '04';
  const { fund_org_code, api_url } = params;
  const api_token = fund_org_code;
  return dao.apiCreate({
    api_type, fund_org_code, api_token, api_url,
  }, { transaction: t });
};
const UserAttributeFundApiUrlDelete = (req, params, t = null) => {
  const dao = Dao(req);
  const api_type = '04';
  const { fund_org_code, api_url } = params;
  return dao.apiDelete({
    where: { fund_org_code, api_url, api_type },
    transaction: t,
  });
};

const userAttributeManagementQueryAndCount = (req, params) => {
  const dao = Dao(req);
  const {
    org_code, partner_nature, is_debt_exchange, page_index,
  } = params;
  return Promise.all([
    dao.count({ org_code, partner_nature, is_debt_exchange }),
    dao.manageQuery({ org_code, partner_nature, is_debt_exchange }, page_index),
  ]);
};
module.exports = {
  userAttributeQuery,
  UserAttributeUpdate,
  UserAttributeFundApiUrlCheck,
  UserAttributeFundApiUrlUpdate,
  UserAttributeFundApiUrlCreate,
  UserAttributeFundApiUrlDelete,
  userAttributeManagementQueryAndCount,
};
