/**
 * @author robin
 * @file EnterpriseInformationDetail
 * @date 2018-04-23 17:07
 */
const _ = require('lodash');
const sequelize = require('sequelize');

const {Op} = sequelize;
const Model = require('../super');
const {db, sequelizeDB} = require('../../schema/index');

//"countPublicityTaskDetail": "select count(*) as total from t_task_enterprise_pi_craw_detail where 1=1 and org_code=:?org_code and task_name=:?task_name and task_status=:?task_status and company_name=:?company_name",
class EnterpriseInformationDetail extends Model {
  count(param){
    return this.nativeCount({where:param});
  }
  query(params ={}) {
    const attributes = [
      [sequelize.literal('count( * )'), 'total']
    ]
    const where = {}
    this.queryParamsLikeSetupBuilder(params, where, 'org_code')
    this.queryParamsLikeSetupBuilder(params, where, 'task_name')
    this.queryParamsLikeSetupBuilder(params, where, 'task_status')
    this.queryParamsLikeSetupBuilder(params, where, 'company_name')

    return this.dao.findAll({
      raw: true,
      attributes,
      where
    })
  }
}

//const user = new User('t_user');
module.exports = (info, accessList = []) => new EnterpriseInformationDetail('t_task_enterprise_pi_craw_detail', info, accessList);
