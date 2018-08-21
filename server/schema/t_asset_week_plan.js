/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_asset_week_plan', {
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
    tableName: 't_asset_week_plan',
    chineseTableName:"【统计汇总】—资产方日需求计划",
    chineseFieldName: {
      asset_org_code: "资产方机构号",
      plan_date: "计划日",
      plan_fee: "金额",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
