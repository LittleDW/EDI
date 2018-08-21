/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_enterprise_credit_voucher', {
    asset_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
      primaryKey: true
    },
    borrow_business_license: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    voucher_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    voucher_url: {
      type: DataTypes.STRING(500),
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
    tableName: 't_enterprise_credit_voucher',
    chineseTableName:"企业-授信凭证表",
    chineseFieldName: {
      asset_org_code: "资产方机构编码",
      borrow_business_license: "企业营业执照号",
      voucher_name: "凭证名",
      voucher_url: "凭证URL",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
