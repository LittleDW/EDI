/**
 * @author robin
 * @file index
 * @date 2018-04-26 11:32
 */
const _ = require('lodash');
const moment = require('moment');
const path = require('path');

const {
  search: searchService,
  create:createService,
  update:updateService,
  deleteService,
  funcSearch:funcSearchService,
  funcUpdate:funcUpdateService,
  userAdd:userAddService,
  userDelete:userDeleteService,
  userSearch:userSearchService
} = require('../../services').business.role;
const {createTableExportingLog, parsingStream, pagingSpawningService} = require('../../services').business.common;
const {getMySQLFieldValue, logger, removefileIfExist, uuidv4, userDiffer} = require('../../util');


const search = async (req, res, next) => {
  let {pageIndex} = req.body, myPageIndex = (isNaN(pageIndex) || (pageIndex < 1)) ? 0 : 10 * (pageIndex - 1),
    params = getMySQLFieldValue({...req.body, pageIndex: myPageIndex,
      [userDiffer(req.session.profile.user_type, ['admin_org_code','fund_org_code', 'asset_org_code'])]:req.session.profile.org_code})
  let result = await searchService(params, req)
  res.json({success: true, ...result})
};

const create = async (req, res, next) => {
  let role_id = uuidv4(), user_id = req.session.profile.user_id,
    params = getMySQLFieldValue(Object.assign({}, req.body, {role_id: role_id, create_user_id: user_id,}))

  let result = await createService(params, req)
  res.json({success: true, ...result})
};

const update = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body)
  let result = await updateService(params, req)
  res.json({success: true, ...result})
};

const deleteCtrl = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body)
  let result = await deleteService(params, req)
  res.json({success: true, ...result})
};

const funcSearch = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body)
  let result = await funcSearchService(params, req)
  res.json({success: true, ...result})
};

const funcUpdate = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body)
  let result = await funcUpdateService(params, req)
  res.json({success: true, ...result})
};

const userAdd = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body)
  let result = await userAddService(params, req)
  res.json({success: true, ...result})
};

const userDelete = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body)
  let result = await userDeleteService(params, req)
  res.json({success: true, ...result})
};

const userSearch = async (req, res, next) => {
  let params = getMySQLFieldValue(req.body)
  let result = await userSearchService(params, req)
  res.json({success: true, ...result})
};

module.exports = {
  search,
  create,
  update,
  deleteCtrl,
  funcSearch,
  funcUpdate,
  userAdd,
  userDelete,
  userSearch
};
