const _ = require('lodash');
const sequelize = require('sequelize');
const Model = require('../super');
const { db, sequelizeDB } = require('../../schema/index');

class AssetApi extends Model {
  // query(params ={}) {
  //   const attributes = [
  //     ['asset_org_code', 'asset_org_code'],
  //     ['api_type', 'api_type'],
  //     ['api_url', 'api_url'],
  //     ['api_token', 'api_token'],
  //     [sequelize.fn('DATE_FORMAT', 't_asset_api.rx_insertTime', '\'%Y-%m-%d %H:%i:%S\''), 'rx_insertTime']
  //   ]
  //   const where = {}
  //   this.queryParamsLikeSetupBuilder(params, where, 'asset_org_code')
  //   return this.dao.findAll({
  //     raw: true,
  //     attributes,
  //     where,
  //     order: [
  //       sequelize.col('t_asset_api.asset_org_code'),
  //       sequelize.col('t_asset_api.api_type'),
  //     ],
  //     offset: params.page_index,
  //     limit: 10,
  //   })
  // }
  queryAndCount(params = {}, page_index = 0) {
    const attributes = [
      ['asset_org_code', 'asset_org_code'],
      ['api_type', 'api_type'],
      ['api_url', 'api_url'],
      ['api_token', 'api_token'],
      [sequelize.fn('DATE_FORMAT', sequelize.col('rx_insertTime'), '%Y-%m-%d %H:%i:%S'), 'rx_insertTime'],
    ];
    const where = {};
    this.queryParamsLikeSetupBuilder(params, where, 'asset_org_code');
    return this.dao.findAndCountAll({
      attributes,
      where,
      order: ['asset_org_code', 'api_type'],
      offset: page_index,
      limit: 10,
    });
  }

  // queryCount(params ={}) {
  //   const attributes = [
  //     [sequelize.literal('count( * )'), 'total']
  //   ]
  //   const where = {}
  //   this.queryParamsLikeSetupBuilder(params, where, 'asset_org_code')
  //   return this.dao.findAll({
  //     raw: true,
  //     attributes,
  //     where
  //   })
  // }

  queryCheck(params = {}) {
    const attributes = [
      ['asset_org_code', 'asset_org_code'],
      ['api_type', 'api_type'],
      ['api_url', 'api_url'],
      ['api_token', 'api_token'],
    ];
    const where = {};
    this.queryParamsLikeSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsLikeSetupBuilder(params, where, 'api_type');
    return this.dao.find({
      attributes,
      where,
    });
  }
}

module.exports = (info, accessList = []) => new AssetApi('t_asset_api', info, accessList);
