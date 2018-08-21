const sequelize = require('sequelize');
const { Op } = require('sequelize');
const Model = require('../super');
const { db, sequelizeDB } = require('../../schema/index');
const _ = require('lodash');

// "userAttributeManagement_Count": "select count(1) as total FROM t_user_attribute where 1=1 and org_code like :?org_code  and partner_nature = :?partner_nature and is_debt_exchange = :?is_debt_exchange",
// "userAttributeManagement_Query": "select ifnull(org_code,'') as org_code,ifnull(partner_nature,'') as partner_nature,ifnull(is_debt_exchange,0) as is_debt_exchange,repayment_mode,ifnull(is_deadline_favor,0) as is_deadline_favor,product_deadline,supervise_bank,(select ifnull(api_url,'') from t_fund_api where fund_org_code=t_user_attribute.org_code and api_type='04') as api_url FROM t_user_attribute where 1=1 and org_code like :?org_code and partner_nature = :?partner_nature and is_debt_exchange = :?is_debt_exchange order by org_code,partner_nature limit :?page_index,10",
// "UserAttributeQuery": "select ifnull(org_code,'') as org_code,ifnull(partner_nature,'') as partner_nature,ifnull(is_debt_exchange,0) as is_debt_exchange,repayment_mode,ifnull(is_deadline_favor,0) as is_deadline_favor,product_deadline,supervise_bank,(select ifnull(api_url,'') from t_fund_api where fund_org_code=t_user_attribute.org_code and api_type='04') as api_url FROM t_user_attribute where 1=1 and user_id=:?user_id",
// "UserAttributeUpdate": "update t_user_attribute set partner_nature=:?partner_nature,is_debt_exchange=:?is_debt_exchange,repayment_mode=:?repayment_mode,is_deadline_favor=:?is_deadline_favor,product_deadline=:!product_deadline,supervise_bank=:?supervise_bank where 1=1 and user_id=:?user_id",
// "userAttributeQueryForFeePattern": "SELECT user_id, platform_pay_mode, Round(platform_use_rate*100,3) as platform_use_rate, Round(adjust_platform_use_rate*100,3) as adjust_platform_use_rate, adjust_effect_month, platform_pay_scope from t_user_attribute where 1=1 and user_id=:?user_id",
// "userAttributeUpdateForFeePattern": "update t_user_attribute set rx_updateTime=now(), platform_pay_mode=:?platform_pay_mode, platform_use_rate=:?platform_use_rate, adjust_platform_use_rate=:!adjust_platform_use_rate, adjust_effect_month=:!adjust_effect_month, platform_pay_scope=:!platform_pay_scope where 1=1 and user_id=:?user_id",

class UserAttribute extends Model {
  count(param = {}) {
    const where = {};
    this.queryParamsLikeSetupBuilder(param, where, 'org_code');
    this.queryParamsStringSetupBuilder(param, where, 'partner_nature');
    this.queryParamsStringSetupBuilder(param, where, 'is_debt_exchange');
    return this.dao.count({
      where,
    });
  }

  freePatternQueryAll(param = {}) {
    const attributes = [
      'user_id',
      'platform_pay_mode',
      [sequelize.literal('Round(platform_use_rate*100,3)'), 'platform_use_rate'],
      [
        sequelize.literal('Round(adjust_platform_use_rate*100,3)'),
        'adjust_platform_use_rate',
      ],
      'adjust_effect_month',
      'platform_pay_scope',
    ];
    return this.dao.findAll({
      attributes,
      where: param,
      raw: true
    });
  }

  queryAll(param = {}) {
    const attributes = [
      [sequelize.fn('IFNULL', sequelize.col('org_code'), ''), 'org_code'],
      [sequelize.fn('IFNULL', sequelize.col('partner_nature'), ''), 'partner_nature'],
      [sequelize.fn('IFNULL', sequelize.col('is_debt_exchange'), ''), 'is_debt_exchange'],
      'repayment_mode',
      [sequelize.fn('IFNULL', sequelize.col('is_deadline_favor'), ''), 'is_deadline_favor'],
      'product_deadline',
      'supervise_bank',
      [
        sequelize.literal('(select ifnull(api_url,"") from t_fund_api where fund_org_code=t_user_attribute.org_code and api_type="04")'),
        'api_url',
      ],
    ];
    return this.dao.findAll({
      attributes,
      where: param,
    });
  }

  findUserAttribute(param = {}) {
    const attributes = ['user_id','fund_account_mode', 'is_auto_credit', 'check_day', 'raise_day',];
    return this.dao.find({
      attributes,
      where: param,
    });
  }

  query(param = {}, page_index = 1) {
    const attributes = [
      [sequelize.fn('IFNULL', sequelize.col('org_code'), ''), 'org_code'],
      [sequelize.fn('IFNULL', sequelize.col('partner_nature'), ''), 'partner_nature'],
      [sequelize.fn('IFNULL', sequelize.col('is_debt_exchange'), ''), 'is_debt_exchange'],
      'repayment_mode',
      [sequelize.fn('IFNULL', sequelize.col('is_deadline_favor'), ''), 'is_deadline_favor'],
      'product_deadline',
      'supervise_bank',
      [
        sequelize.literal('(select ifnull(api_url,"") from t_fund_api where fund_org_code=t_user_attribute.org_code and api_type="04")'),
        'api_url',
      ],
    ];
    const where = {};
    this.queryParamsLikeSetupBuilder(param, where, 'org_code');
    this.queryParamsStringSetupBuilder(param, where, 'partner_nature');
    this.queryParamsStringSetupBuilder(param, where, 'is_debt_exchange');
    return this.dao.findAll({
      attributes,
      order: ['org_code', 'partner_nature'],
      where,
      offset: page_index,
      limit: 10,
    });
  }

  update(param = {}) {
    const { user_id } = param;
    const cloneParam = _.cloneDeep(param);
    delete cloneParam.user_id;
    return this.nativeUpdate(cloneParam, {
      where: { user_id },
    });
  }

  // "checkUserInfoIntegrity": "select partner_nature from t_user_attribute where user_id=:?user_id and ifnull(partner_nature,'')!=''",
  checkUserInfoIntegrity(params = {}) {
    return sequelizeDB.query(
      `
    SELECT
      partner_nature
    FROM
      t_user_attribute
    WHERE
      ifnull( partner_nature, '' ) != ''
    ${_.isEmpty(params.user_id) ? '' : `AND user_id='${params.user_id}'`}
    `,
      { type: sequelize.QueryTypes.SELECT },
    );
  }

  userAttributeAdd(transaction) {
    return sequelizeDB.query(
      'insert into t_user_attribute(user_id, org_code,rx_insertTime,rx_updateTime) select a.user_id,a.org_code,now(),now() from t_user as a where not exists (select 1 from t_user_attribute as b where a.user_id = b.user_id)',
      {
        raw: true,
        transaction,
      },
    );
  }
}

// const userAttribute = new UserAttribute('t_user_attribute');
module.exports = (info, accessList = []) => new UserAttribute('t_user_attribute', info, accessList);
