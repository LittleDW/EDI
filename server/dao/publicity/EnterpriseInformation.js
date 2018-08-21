/**
 * @author robin
 * @file EnterpriseInformation
 * @date 2018-04-23 17:06
 */
const _ = require('lodash');
const sequelize = require('sequelize');

const {Op} = sequelize;
const Model = require('../super');
const {db, sequelizeDB} = require('../../schema/index');

//"countPublicityTaskDetail": "select count(*) as total from t_task_enterprise_pi_craw_detail where 1=1 and org_code=:?org_code and task_name=:?task_name and task_status=:?task_status and company_name=:?company_name",
class EnterpriseInformation extends Model {
  query(params = {}, page_index=0) {
    const where = {}
    this.queryParamsLikeSetupBuilder(params, where, 'org_code')
    this.queryParamsLikeSetupBuilder(params, where, 'task_name')
    this.durationGenerator(params, where, 'task_createtime', 'start_date', 'end_date')
    const attributes = [
      ['org_code', 'org_code'],
      ['task_name', 'task_name'],
      ['task_status', 'task_status'],
      [sequelize.literal('format(t_task_enterprise_pi_craw.total_count, 0 )'), 'total_count'],
      [sequelize.literal('format(t_task_enterprise_pi_craw.finish_count, 0 )'), 'finish_count'],
      [sequelize.literal('format(t_task_enterprise_pi_craw.fail_count, 0 )'), 'fail_count'],
      [sequelize.literal('DATE_FORMAT(t_task_enterprise_pi_craw.task_createtime, \'%Y-%m-%d %H:%i:%S\' )'), 'task_createtime'],
      /*[sequelize.fn('format', sequelize.col('t_task_enterprise_pi_craw.total_count')), 'total_count'],
      [sequelize.fn('format', sequelize.col('t_task_enterprise_pi_craw.finish_count')), 'finish_count'],
      [sequelize.fn('format', sequelize.col('t_task_enterprise_pi_craw.fail_count')), 'fail_count'],*/
      /*[sequelize.fn('DATE_FORMAT', sequelize.col('t_task_enterprise_pi_craw.task_createtime'), '\'%Y-%m-%d %H:%i:%S\''), 'task_createtime'],*/
      "down_url",
    ]
    return this.dao.findAll({
      attributes,
      where,
      order: [[sequelize.col('t_task_enterprise_pi_craw.task_createtime'), 'DESC']],
      offset: page_index,
      limit: 10
    })
  }

  queryAll(params = {}) {
    const where = {}
    this.queryParamsLikeSetupBuilder(params, where, 'org_code')
    this.queryParamsLikeSetupBuilder(params, where, 'task_name')
    this.durationGenerator(params, where, 'task_createtime', 'start_date', 'end_date')
    const attributes = [
      ['org_code', 'org_code'],
      ['task_name', 'task_name'],
      ['task_status', 'task_status'],
      [sequelize.literal('format(t_task_enterprise_pi_craw.total_count, 0 )'), 'total_count'],
      [sequelize.literal('format(t_task_enterprise_pi_craw.finish_count, 0 )'), 'finish_count'],
      [sequelize.literal('format(t_task_enterprise_pi_craw.fail_count, 0 )'), 'fail_count'],
      [sequelize.literal('DATE_FORMAT(t_task_enterprise_pi_craw.task_createtime, \'%Y-%m-%d %H:%i:%S\' )'), 'task_createtime'],
      /*[sequelize.fn('format', sequelize.col('t_task_enterprise_pi_craw.total_count')), 'total_count'],
      [sequelize.fn('format', sequelize.col('t_task_enterprise_pi_craw.finish_count')), 'finish_count'],
      [sequelize.fn('format', sequelize.col('t_task_enterprise_pi_craw.fail_count')), 'fail_count'],*/
      /*[sequelize.fn('DATE_FORMAT', sequelize.col('t_task_enterprise_pi_craw.task_createtime'), '\'%Y-%m-%d %H:%i:%S\''), 'task_createtime'],*/
      "down_url",
    ]
    return this.dao.findAll({
      attributes,
      where,
      order: [[sequelize.col('t_task_enterprise_pi_craw.task_createtime'), 'DESC']],
    })
  }

  count(params){
    const where = {}
    this.queryParamsLikeSetupBuilder(params, where, 'org_code')
    this.queryParamsLikeSetupBuilder(params, where, 'task_name')
    this.durationGenerator(params, where, 'task_createtime', 'start_date', 'end_date')
    const attributes = [
      [sequelize.literal('count( * )'), 'total'],
      [sequelize.literal('format( sum( t_task_enterprise_pi_craw.total_count ), 0 )'), 'total_count'],
      [sequelize.literal('format( sum( t_task_enterprise_pi_craw.finish_count ), 0 )'), 'finish_count'],
      [sequelize.literal('format( sum( t_task_enterprise_pi_craw.fail_count ), 0 )'), 'fail_count'],
    ]
    return this.dao.findAll({
      attributes,
      where,
    })
  }

  queryTaskCount(params = {}) {
    const attributes = [
      [sequelize.literal('count( * )'), 'total']
    ]
    const where = {}
    this.queryParamsLikeSetupBuilder(params, where, 'task_name')
    this.queryParamsLikeSetupBuilder(params, where, 'org_code')

    return this.dao.findAll({
      raw: true,
      attributes,
      where
    })

  }

  publicityQuery(param){
    return this.nativeCount({where:param});
  }

}

//const user = new User('t_user');
module.exports = (info, accessList = []) => new EnterpriseInformation('t_task_enterprise_pi_craw', info, accessList);
