/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_fund_day_plan', {
    fund_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    asset_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    plan_date: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    plan_fee: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    data_from: {
      type: DataTypes.STRING(1),
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
      },
    }
  }, {
    tableName: 't_fund_day_plan',
    chineseTableName:"资金方日募集计划",
    chineseFieldName: {
      fund_org_code: "资金方机构号",
      asset_org_code: "资产方机构号",
      plan_date: "期限编码",
      plan_fee: "计划占比",
      data_from: "数据来源",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
