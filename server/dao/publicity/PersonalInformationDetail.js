/**
 * @author robin
 * @file PersonalInformationDetail
 * @date 2018-04-23 17:07
 */
const _ = require('lodash');
const sequelize = require('sequelize');
const Model = require('../super');
const { db, sequelizeDB } = require('../../schema/index');

class PersonalInformationDetail extends Model {
  count(params = {}) {
    const where = {};
    this.queryParamsLikeSetupBuilder(params, where, 'org_code');
    this.queryParamsLikeSetupBuilder(params, where, 'task_name');
    this.queryParamsLikeSetupBuilder(params, where, 'task_status');
    this.queryParamsLikeSetupBuilder(params, where, 'borrow_certificate_no');
    this.queryParamsLikeSetupBuilder(params, where, 'borrow_name');
    this.queryParamsLikeSetupBuilder(params, where, 'borrow_phone');
    this.queryParamsLikeSetupBuilder(params, where, 'borrow_card_no');

    return this.dao.count({
      raw: true,
      where,
    });
  }
}

module.exports = (info, accessList = []) =>
  new PersonalInformationDetail('t_task_person_pi_craw_detail', info, accessList);
