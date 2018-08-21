/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_finance_loan_repayment_plan', {
    id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
      primaryKey: true
    },
    issue_no: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
      primaryKey: true
    },
    loan_code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    repayment_date: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    principal_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    interest_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    service_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
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
    tableName: 't_finance_loan_repayment_plan',
    chineseTableName:"放款对账单明细对应的分期还款计划",
    chineseFieldName: {
      id: "ID",
      issue_no: "期次",
      loan_code: "对账单编号",
      repayment_date: "到期还款日",
      principal_fee: "本金",
      interest_fee: "利息",
      service_fee: "服务费",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
