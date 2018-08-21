const sequelize = require('sequelize');
const { Op } = require('sequelize');
const Model = require('../super');
const { db } = require('../../schema/index');
const _ = require('lodash');

// "ediPayDetailAdd": "INSERT INTO t_edi_pay_detail set pay_no=:?pay_no, org_code=:?org_code, pay_date=:?pay_date, pay_fee=:?pay_fee, comment=:?comment, rx_insertTime=now(), rx_updateTime=now()",
// "ediPayDetailQuery": "SELECT a.pay_no, DATE_FORMAT(a.rx_insertTime, '%Y-%m-%d %H:%i:%s') as create_time, DATE_FORMAT(a.pay_date, '%Y-%m-%d') as pay_date, b.user_type, b.user_name, Round(pay_fee/100,2) as pay_fee, a.comment FROM t_edi_pay_detail AS a INNER JOIN t_user AS b ON a.org_code=b.org_code where 1=1 and a.rx_insertTime >= :?create_time_start and a.rx_insertTime <= :?create_time_end and a.pay_date >= :?pay_date_start and a.pay_date <= :?pay_date_end and b.user_type = :?user_type and b.org_code = :?org_code ORDER BY a.rx_insertTime DESC limit :?page_index,10",
class EdiPayDetail extends Model {
  add(param = {}) {
    return this.dao.create(param);
  }
  query(param = {}) {
    const attributes = [
      'pay_no',
      [
        sequelize.fn(
          'DATE_FORMAT',
          sequelize.col('`t_edi_pay_detail`.`rx_insertTime`'),
          '%Y-%m-%d %H:%i:%S',
        ),
        'create_time',
      ],
      [
        sequelize.fn('DATE_FORMAT', sequelize.col('pay_date'), '%Y-%m-%d'),
        'pay_date',
      ],
      [sequelize.literal('Round( pay_fee / 100, 2 )'), 'pay_fee'],
      'comment',
      [sequelize.col('`t_user`.`user_type`'), 'user_type'],
      [sequelize.col('`t_user`.`user_name`'), 'user_name'],
    ];
    
    const where = {};
    const subWhere = {};
    this.queryParamsGTESetupBuilder(
      param,
      where,
      'rx_insertTime',
      'create_time_start',
    );
    this.queryParamsLTESetupBuilder(
      param,
      where,
      'rx_insertTime',
      'create_time_end',
    );
    this.queryParamsLTESetupBuilder(param, where, 'pay_date', 'pay_date_start');
    this.queryParamsLTESetupBuilder(param, where, 'pay_date', 'pay_date_end');
    this.queryParamsStringSetupBuilder(param, subWhere, 'user_type');
    this.queryParamsStringSetupBuilder(param, subWhere, 'org_code');
    return this.dao.findAll({
      attributes,
      include: [
        {
          model: this.db.t_user,
          as: 't_user',
          attributes: [],
          required: true,
          where: subWhere,
        },
      ],
      where,
      order: [
        [sequelize.literal('`t_edi_pay_detail`.`rx_insertTime`'), 'DESC'],
      ],
      offset: param.page_index || 0,
      limit: 10,
      raw: true,
    });
  }

  count(param = {}) {
    const attributes = [];
    const where = {};
    const subWhere = {};
    this.queryParamsGTESetupBuilder(
      param,
      where,
      'rx_insertTime',
      'create_time_start',
    );
    this.queryParamsLTESetupBuilder(
      param,
      where,
      'rx_insertTime',
      'create_time_end',
    );
    this.queryParamsLTESetupBuilder(param, where, 'pay_date', 'pay_date_start');
    this.queryParamsLTESetupBuilder(param, where, 'pay_date', 'pay_date_end');
    this.queryParamsStringSetupBuilder(param, subWhere, 'user_type');
    this.queryParamsStringSetupBuilder(param, subWhere, 'org_code');
    return this.dao.count({
      attributes,
      include: [
        {
          model: this.db.t_user,
          attributes: [],
          required: true,
          where: subWhere,
        },
      ],
      where,
      subQuery: false,
    });
  }
}

// const ediPayDetail = new EdiPayDetail('t_edi_pay_detail');
module.exports = (info, accessList = []) =>
  new EdiPayDetail('t_edi_pay_detail', info, accessList);
