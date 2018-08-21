/**
 * @author robin
 * @file PersonalInformation
 * @date 2018-04-23 17:07
 */
const _ = require('lodash');
const sequelize = require('sequelize')
const Model = require('../super');
const { db, sequelizeDB } = require('../../schema/index');

// "publicityPersonalSearch": "SELECT org_code, task_name, task_status, format(total_count,0) as total_count, format(finish_count,0) as finish_count,  format(fail_count,0) as fail_count, DATE_FORMAT( task_createtime, '%Y-%m-%d %H:%i:%S' ) AS task_createtime, down_url FROM t_task_person_pi_craw where 1 = 1 and org_code like :?org_code and task_createtime >= :?start_date and task_createtime <= :?end_date and task_name like :?task_name ORDER BY task_createtime DESC limit :?page_index,10",
class PersonalInformation extends Model {
  query(params = {}, page_index=0) {
    const where = {}
    this.queryParamsLikeSetupBuilder(params, where, 'org_code')
    this.queryParamsLikeSetupBuilder(params, where, 'task_name')
    this.durationGenerator(params, where, 'task_createtime', 'start_date', 'end_date')
    const attributes = [
      ['org_code', 'org_code'],
      ['task_name', 'task_name'],
      ['task_status', 'task_status'],
      [sequelize.literal('format(t_task_person_pi_craw.total_count, 0 )'), 'total_count'],
      [sequelize.literal('format(t_task_person_pi_craw.finish_count, 0 )'), 'finish_count'],
      [sequelize.literal('format(t_task_person_pi_craw.fail_count, 0 )'), 'fail_count'],
      [sequelize.literal('DATE_FORMAT(t_task_person_pi_craw.task_createtime, \'%Y-%m-%d %H:%i:%S\' )'), 'task_createtime'],
      'down_url'
    ]
    return this.dao.findAll({
      attributes,
      where,
      order: [[sequelize.col('t_task_person_pi_craw.task_createtime'), 'DESC']],
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
      [sequelize.literal('format(t_task_person_pi_craw.total_count, 0 )'), 'total_count'],
      [sequelize.literal('format(t_task_person_pi_craw.finish_count, 0 )'), 'finish_count'],
      [sequelize.literal('format(t_task_person_pi_craw.fail_count, 0 )'), 'fail_count'],
      [sequelize.literal('DATE_FORMAT(t_task_person_pi_craw.task_createtime, \'%Y-%m-%d %H:%i:%S\' )'), 'task_createtime'],
      'down_url'
    ]
    return this.dao.findAll({
      attributes,
      where,
      order: [[sequelize.col('t_task_person_pi_craw.task_createtime'), 'DESC']],
    })
  }
  count(params){
    const where = {}
    this.queryParamsLikeSetupBuilder(params, where, 'org_code')
    this.queryParamsLikeSetupBuilder(params, where, 'task_name')
    this.durationGenerator(params, where, 'task_createtime', 'start_date', 'end_date')
    const attributes = [
      [sequelize.literal('count( * )'), 'total'],
      [sequelize.literal('format( sum( t_task_person_pi_craw.total_count ), 0 )'), 'total_count'],
      [sequelize.literal('format( sum( t_task_person_pi_craw.finish_count ), 0 )'), 'finish_count'],
      [sequelize.literal('format( sum( t_task_person_pi_craw.fail_count ), 0 )'), 'fail_count'],
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

module.exports = (info, accessList = [])=>new PersonalInformation('t_task_person_pi_craw',info, accessList)
