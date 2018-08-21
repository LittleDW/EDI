/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_enterprise_credit_credit', {
    asset_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    borrow_business_license: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    credit_org: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      primaryKey: true
    },
    credit_result: {
      type: DataTypes.STRING(1000),
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
    tableName: 't_enterprise_credit_credit',
    chineseTableName:"授信征信信息",
    chineseFieldName: {
      asset_org_code: "资产方机构号",
      borrow_business_license: "营业执照号",
      credit_org: "授信机构",
      credit_result: "授信结果",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
