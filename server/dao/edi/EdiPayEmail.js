const sequelize = require('sequelize');
const { Op } = require('sequelize');
const Model = require('../super');
const { db } = require('../../schema/index');
const _ = require('lodash');

// "ediPayEmailQueryByKey": "SELECT * from t_edi_pay_email where 1=1 and org_code =:?org_code and email =:?email order by rx_insertTime desc",
class EdiPayEmail extends Model {
  add(param = {}) {
    return this.dao.create(param);
  }

  query(param = {}) {
    const where = {}
    this.queryParamsStringSetupBuilder(param, where, 'org_code')
    this.queryParamsStringSetupBuilder(param, where, 'email')
    return this.dao.findAll({
      order: [['rx_insertTime', 'DESC']],
      where,
    });
  }
}

module.exports = (info, accessList = []) =>
  new EdiPayEmail('t_edi_pay_email', info, accessList);
