/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_finance_fund_income_outgo_list', {
    asset_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    fund_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    statistics_date: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    source_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    finance_type: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      primaryKey: true
    },
    income_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    outgo_fee: {
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
    tableName: 't_finance_fund_income_outgo_list',
    chineseTableName:"资金方财务收入支出清单",
    chineseFieldName: {
      asset_org_code: "资产方机构号",
      fund_org_code: "资金方机构号",
      statistics_date: "统计日期",
      source_code: "来源单号",
      finance_type: "财务类型",
      income_fee: "收入",
      outgo_fee: "支出",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
