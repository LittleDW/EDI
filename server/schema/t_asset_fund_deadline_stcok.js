/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_asset_fund_deadline_stcok', {
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
    deadline_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    fund_stock_fee: {
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
    tableName: 't_asset_fund_deadline_stcok',
    chineseTableName:"资产资金期限存量分布表",
    chineseFieldName: {
      asset_org_code: "资产方机构号",
      fund_org_code: "资金方机构号",
      deadline_id: "期限编码",
      fund_stock_fee: "资金方存量",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
