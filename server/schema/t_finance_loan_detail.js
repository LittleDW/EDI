/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_finance_loan_detail', {
    id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    loan_code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    target_no: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    target_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    borrow_name: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    recommended_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    recommended_short_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    payee_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fill_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    account_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    account_fee: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    borrow_end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    interest_mode: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    interest_daycount: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    interest_rate: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    service_rate: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    all_rate: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    repayment_mode: {
      type: DataTypes.CHAR(3),
      allowNull: false
    },
    service_fee_mode: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    principal_period_count: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    interest_period_count: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    service_fee_period_count: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    each_repayment_day: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    interest_total_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    service_total_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    service_settlement_month: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    already_repayment_principal_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    already_repayment_interest_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    already_repayment_service_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    remaining_principal_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    remaining_interest_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    remaining_service_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    remark: {
      type: DataTypes.STRING(100),
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
      },
    },
  }, {
    tableName: 't_finance_loan_detail',
    chineseTableName:"放款对账单明细",
    chineseFieldName: {
      id: "ID",
      loan_code: "对账单编号",
      target_no: "标的编号",
      target_name: "标的名称",
      borrow_name: "借款人名称",
      recommended_name: "业务推荐方名称",
      recommended_short_name: "业务推荐方简称",
      payee_name: "收款方名称",
      fill_date: "满标日期",
      account_date: "出账日期",
      payment_date: "到账日期",
      account_fee: "出账金额",
      borrow_end_date: "借款到期日",
      interest_mode: "计息方式",
      interest_daycount: "计息天数",
      interest_rate: "借款利率",
      service_rate: "服务费率",
      all_rate: "综合费率",
      repayment_mode: "本息还款方式",
      service_fee_mode: "服务费结算方式",
      principal_period_count: "本金总期数",
      interest_period_count: "利息总期数",
      service_fee_period_count: "服务费总期数",
      each_repayment_day: "每期还款日",
      interest_total_fee: "利息总额",
      service_total_fee: "服务费总额",
      service_settlement_month: "服务费结算月份",
      already_repayment_principal_count: "已还本金期数（历史数据）",
      already_repayment_interest_count: "已还利息期数（历史数据）",
      already_repayment_service_count: "已还服务费期数（历史数据）",
      remaining_principal_fee: "剩余本金（历史数据）",
      remaining_interest_fee: "剩余利息（历史数据）",
      remaining_service_fee: "剩余服务费（历史数据）",
      remark: "备注",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
