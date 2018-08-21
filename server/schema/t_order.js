/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_order', {
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
      type: DataTypes.STRING(20),
      allowNull: true
    },
    borrow_certificate_type: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    borrow_certificate_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    borrow_phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    borrow_bank: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    borrow_card_type: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    borrow_card_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    borrow_area: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    borrow_work_address: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    borrow_family_address: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    borrow_census_address: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    borrow_pay_mode: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    borrow_purpose: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    borrow_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
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
    borrow_credit_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    borrow_credit_report: {
      type: DataTypes.STRING(2000),
      allowNull: true
    },
    borrow_income_report: {
      type: DataTypes.STRING(2000),
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
    business_type: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    repayment_mode: {
      type: DataTypes.CHAR(3),
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
    occupation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fund_receive_mode: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'A'
    },
    repayment_from: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    borrow_mail: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    credit_org: {
      type: DataTypes.CHAR(3),
      allowNull: true,
      defaultValue: ''
    },
    credit_score: {
      type: DataTypes.INTEGER(11),
      allowNull: true
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
      allowNull: false,
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
    }
  }, {
    tableName: 't_order',
    chineseTableName:"债权订单表",
    chineseFieldName: {
      order_no: "平台订单号",
      order_status: "订单状态",
      asset_org_code: "资产方机构号",
      asset_order_no: "资产方订单号",
      borrow_date: "借款日期",
      borrow_type: "借款类型",
      borrow_name: "借款人",
      borrow_certificate_type: "借款人证件类型",
      borrow_certificate_no: "借款人证件号",
      borrow_phone: "借款人银行预留手机号",
      borrow_bank: "借款人开户行",
      borrow_card_type: "借款人银行卡类型",
      borrow_card_no: "借款人银行卡号",
      borrow_area: "借款人所属地区",
      borrow_work_address: "借款人工作地址",
      borrow_family_address: "借款人家庭地址",
      borrow_census_address: "借款人户籍地址",
      borrow_pay_mode: "借款支付方式",
      borrow_purpose: "借款用途",
      borrow_fee: "借款金额",
      borrow_period: "借款周期单位",
      borrow_deadline: "借款期限",
      borrow_daycount: "借款天数",
      borrow_credit_fee: "借款人授信额度",
      borrow_credit_report: "借款人征信报告",
      borrow_income_report: "借款人收入及负载情况",
      gathering_name: "收款账户名称",
      gathering_bank: "收款账户开户行",
      gathering_card_no: "收款账户号",
      fund_org_code: "资金方机构号",
      fund_order_no: "资金方订单号",
      bank_loan_contract_no: "银行贷款合同号",
      refuse_type: "拒绝类型",
      refuse_reason: "拒绝原因",
      business_type: "业务类型",
      repayment_mode: "还款方式",
      fill_time: "满标时间",
      data_from: "数据来源",
      occupation: "职业",
      fund_receive_mode: "资金方接收数据模式",
      repayment_from: "还款来源",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
