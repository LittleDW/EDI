/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_enterprise_order', {
    order_no: {
      type: DataTypes.STRING(60),
      allowNull: false,
      primaryKey: true
    },
    order_status: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    asset_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    asset_order_no: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    borrow_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    borrow_type: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    borrow_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    borrow_business_license: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    borrow_purpose: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    borrow_fee: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    borrow_period: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    borrow_deadline: {
      type: DataTypes.INTEGER(50),
      allowNull: true
    },
    borrow_daycount: {
      type: DataTypes.INTEGER(50),
      allowNull: true,
      defaultValue: '0'
    },
    borrow_pay_mode: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    gathering_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    gathering_bank: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    gathering_card_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    gathering_from: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'A'
    },
    business_type: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    repayment_mode_from: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'A'
    },
    repayment_mode: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    is_fixed_fund_org: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    fund_org_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fund_order_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    bank_loan_contract_no: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    refuse_type: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    refuse_reason: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fill_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    data_from: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'A'
    },
    fund_receive_mode: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'A'
    },
    rx_insertTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.Now,
      get: function() {
        let value = this.getDataValue('rx_insertTime')
				if(!_.isNil(value) && _.isDate(value)){
					return moment(value).format('YYYY-MM-DD HH:mm:ss');
				}

        if(_.isString(value) || _.isNumber()){
          return moment(value).format("YYYY-MM-DD HH:mm:ss")
        }
      },
    },
    rx_updateTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.Now,
      get: function() {
        let value = this.getDataValue('rx_updateTime')
				if(!_.isNil(value) && _.isDate(value)){
					return moment(value).format('YYYY-MM-DD HH:mm:ss');
				}

        if(_.isString(value) || _.isNumber()){
          return moment(value).format("YYYY-MM-DD HH:mm:ss")
        }
      },
    },
  }, {
    tableName: 't_enterprise_order',
    chineseTableName:"企业-债权订单表",
    chineseFieldName: {
      order_no: "平台订单号",
      order_status: "订单状态",
      asset_org_code: "资产方机构号",
      asset_order_no: "资产方订单号",
      borrow_date: "借款日期",
      borrow_type: "借款人类型",
      borrow_name: "借款人名称",
      borrow_business_license: "借款人营业执照号",
      borrow_purpose: "借款用途",
      borrow_fee: "借款金额",
      borrow_period: "借款期限单位",
      borrow_deadline: "借款期限",
      borrow_daycount: "借款天数",
      borrow_pay_mode: "借款支付方式",
      gathering_name: "收款账户名称",
      gathering_bank: "收款账户开户行",
      gathering_card_no: "收款账户号",
      gathering_from: "收款人信息来源",
      business_type: "业务类型",
      repayment_mode_from: "还款方式来源",
      repayment_mode: "还款方式",
      is_fixed_fund_org: "是否指定资金方",
      fund_org_code: "资金方机构号",
      fund_order_no: "资金方订单号",
      bank_loan_contract_no: "银行贷款合同号",
      refuse_type: "拒绝类型",
      refuse_reason: "拒绝原因",
      fill_time: "满标时间",
      data_from: "数据来源",
      fund_receive_mode: "资金方接收数据模式",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
