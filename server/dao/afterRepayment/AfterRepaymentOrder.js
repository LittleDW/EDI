/**
 * @author robin
 * @file AfterRepaymentOrder
 * @date 2018-05-17 17:34
 */

const _ = require('lodash');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Model = require('../super');
const { sequelizeDB } = require('../../schema/index');


class AfterRepaymentOrder extends Model {
  pagingSearch(params={},page_index=0){
    //const { asset_org_code,after_repayment_order_status,after_repayment_order_no } = params;
    const attributes = [
      'after_repayment_order_no',
      'asset_org_code',
      'total_number_of_repayments',
      [sequelize.literal('format(remaining_total_fee/100,2)'), 'remaining_total_fee'],
      [sequelize.literal('format(paid_up_total_fee/100,2)'), 'paid_up_total_fee'],
      'order_status','detail_file_url','remark'
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'order_status','after_repayment_order_status');
    this.queryParamsStringSetupBuilder(params, where, 'after_repayment_order_no');

    return this.dao.findAndCountAll({
      attributes,
      where,
      offset: page_index,
      limit: 10,
      order: [['after_repayment_order_no', 'DESC']],
    });
  }

  restrictedSearch(params={},page_index=0){
    const attributes = [
      'after_repayment_order_no',
      'total_number_of_repayments',
      [sequelize.literal('format(remaining_total_fee/100,2)'), 'remaining_total_fee'],
      [sequelize.literal('format(paid_up_total_fee/100,2)'), 'paid_up_total_fee'],
      'order_status','detail_file_url','remark'
    ];
    const where = {};
    this.queryParamsStringSetupBuilder(params, where, 'asset_org_code');
    this.queryParamsStringSetupBuilder(params, where, 'order_status','after_repayment_order_status');
    this.queryParamsStringSetupBuilder(params, where, 'after_repayment_order_no');

    const includingFundAttributes = ['asset_org_code']
    const subWhere = {}
    this.queryParamsStringSetupBuilder(params, subWhere, 'fund_org_code');
    return this.dao.findAndCountPlainAll({
      attributes,
      include: [
        {
          as:"t_asset_fund",
          attributes: includingFundAttributes,
          model: this.db.t_asset_fund, required: true ,
          where:subWhere
        }
      ],
      subQuery:false,
      where,
      offset: page_index,
      limit: 10,
      order: [['after_repayment_order_no', 'DESC']],
    });
    /*const {asset_org_code, fund_org_code,after_repayment_order_status,after_repayment_order_no} = params
    return sequelizeDB.query(
      ` SELECT
	        t_after_repayment_order.after_repayment_order_no as after_repayment_order_no,
	        t_after_repayment_order.total_number_of_repayments as total_number_of_repayments,
	        format(t_after_repayment_order.remaining_total_fee/100,2) as remaining_total_fee,
	        format(t_after_repayment_order.paid_up_total_fee/100,2) as paid_up_total_fee,
	        t_after_repayment_order.order_status as order_status,
	        t_after_repayment_order.detail_file_url as detail_file_url,
	        t_after_repayment_order.remark as remark,
	        t_asset_fund.asset_org_code as asset_org_code,
	        t_asset_fund.fund_org_code as fund_org_code
        FROM
	        t_after_repayment_order AS t_after_repayment_order
	      INNER JOIN
	        t_asset_fund AS t_asset_fund
	        ON t_after_repayment_order.asset_org_code = t_asset_fund.asset_org_code
          ${
        _.isEmpty(fund_org_code)
          ? ''
          : `AND t_asset_fund.fund_org_code = '${fund_org_code}'`
        }
        WHERE
          1 = 1
          ${
        _.isEmpty(asset_org_code)
          ? ''
          : `AND t_after_repayment_order.asset_org_code = '${asset_org_code}'`
        }
          ${
        _.isEmpty(after_repayment_order_status)
          ? ''
          : `AND t_after_repayment_order.order_status = '${after_repayment_order_status}'`
        }
          ${
        _.isEmpty(after_repayment_order_no)
          ? ''
          : `AND t_after_repayment_order.after_repayment_order_no = '${after_repayment_order_no}'`
        }

        ORDER BY
          after_repayment_order_no DESC
        LIMIt
          ${page_index},10
      `,
      {type: sequelize.QueryTypes.SELECT }
    );*/
  }

  restrictedCount(params={}){
    const {asset_org_code, fund_org_code,after_repayment_order_status,after_repayment_order_no} = params
    return sequelizeDB.query(
      ` SELECT
	        COUNT(*) AS total
        FROM
	        t_after_repayment_order AS t_after_repayment_order
	      INNER JOIN 
	        t_asset_fund AS t_asset_fund 
	        ON t_after_repayment_order.asset_org_code = t_asset_fund.asset_org_code 
          ${
          _.isEmpty(fund_org_code)
            ? ''
            : `AND t_asset_fund.fund_org_code = '${fund_org_code}'`
          }
        WHERE
          1 = 1
          ${
          _.isEmpty(asset_org_code)
            ? ''
            : `AND t_after_repayment_order.asset_org_code = '${asset_org_code}'`
          }
          ${
          _.isEmpty(after_repayment_order_status)
            ? ''
            : `AND t_after_repayment_order.order_status = '${after_repayment_order_status}'`
          }
          ${
          _.isEmpty(after_repayment_order_no)
            ? ''
            : `AND t_after_repayment_order.after_repayment_order_no = '${after_repayment_order_no}'`
          }
      `,
      {type: sequelize.QueryTypes.SELECT }
    );
  }
}

module.exports = (info, accessList = []) => new AfterRepaymentOrder('t_after_repayment_order', info, accessList);
