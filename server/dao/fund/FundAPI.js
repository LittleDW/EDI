const sequelize = require('sequelize');
const Model = require('../super');

// "UserAttributeFundApiUrlCheck": "select 1 from t_fund_api  where 1=1 and fund_org_code=:?fund_org_code and api_type='04'",
// "UserAttributeFundApiUrlCreate": "insert into t_fund_api set fund_org_code=:?fund_org_code,api_type='04',api_url=:?api_url,api_token=:?fund_org_code,rx_insertTime=now(), rx_updateTime=now()",
// "UserAttributeFundApiUrlUpdate": "update t_fund_api set api_url=:?api_url where 1=1 and fund_org_code=:?fund_org_code and api_type='04'",

class FundAPI extends Model {
  check(param = {}) {
    const attributes = [[sequelize.literal('1'), 'flag']];
    return this.dao.findAll({
      attributes,
      where: { ...param, api_type: '04' },
    });
  }

  updateAPIURL(param = {}) {
    const { api_url, fund_org_code } = param;
    return this.dao.update(
      { api_url },
      {
        where: { fund_org_code, api_type: '04' },
        individualHooks: true,
      },
    );
  }

  // query(params ={}) {
  //   const attributes = [
  //     ['fund_org_code', 'fund_org_code'],
  //     ['api_type', 'api_type'],
  //     ['api_url', 'api_url'],
  //     ['api_token', 'api_token'],
  //     [sequelize.fn('DATE_FORMAT', 't_fund_api.rx_insertTime', '\'%Y-%m-%d %H:%i:%S\''), 'rx_insertTime']
  //   ]
  //   const where = {}
  //   this.queryParamsLikeSetupBuilder(params, where, 'fund_org_code')
  //   return this.dao.findAll({
  //     raw: true,
  //     attributes,
  //     where,
  //     order: [
  //       sequelize.col('t_fund_api.fund_org_code'),
  //       sequelize.col('t_fund_api.api_type'),
  //     ],
  //     offset: params.page_index,
  //     limit: 10,
  //   })
  // }

  queryAndCount(params = {}, page_index = 0) {
    const attributes = [
      ['fund_org_code', 'fund_org_code'],
      ['api_type', 'api_type'],
      ['api_url', 'api_url'],
      ['api_token', 'api_token'],
      [
        sequelize.fn('DATE_FORMAT', sequelize.col('rx_insertTime'), '%Y-%m-%d %H:%i:%S'),
        'rx_insertTime',
      ],
    ];
    const where = {};
    this.queryParamsLikeSetupBuilder(params, where, 'fund_org_code');
    return this.dao.findAndCountAll({
      attributes,
      where,
      order: ['fund_org_code', 'api_type'],
      offset: page_index,
      limit: 10,
    });
  }
  // queryCount(params ={}) {
  //   const attributes = [
  //     [sequelize.literal('count( * )'), 'total']
  //   ]
  //   const where = {}
  //   this.queryParamsLikeSetupBuilder(params, where, 'fund_org_code')
  //   return this.dao.findAll({
  //     raw: true,
  //     attributes,
  //     where
  //   })
  // }

  queryCheck(params = {}) {
    const attributes = [
      ['fund_org_code', 'fund_org_code'],
      ['api_type', 'api_type'],
      ['api_url', 'api_url'],
      ['api_token', 'api_token'],
    ];
    const where = {};
    this.queryParamsLikeSetupBuilder(params, where, 'fund_org_code');
    this.queryParamsLikeSetupBuilder(params, where, 'api_type');
    return this.dao.find({
      attributes,
      where,
    });
  }
}

// const fundAPI = new FundAPI("t_fund_api");
module.exports = (info, accessList = []) => new FundAPI('t_fund_api', info, accessList);
