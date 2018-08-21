const sequelize = require('sequelize');
const Model = require('../super');
const _ = require('lodash');
const { db } = require('../../schema/index');

class OrgMode extends Model {
  query(params = {}) {
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'org_code');
    this.queryParamsStringSetupBuilder(params, where, 'mode_type');
    return this.dao.nativeQuery({
      order: ['func_level', 'sort_id'],
    });
  }
}

module.exports = (info, accessList = []) => new OrgMode('t_org_mode', info, accessList);
