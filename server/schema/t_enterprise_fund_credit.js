/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_enterprise_fund_credit', {
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
    borrow_business_license: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    fund_credit_status: {
      type: DataTypes.CHAR(3),
      allowNull: false
    },
    fund_credit_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    fund_credit_refuse_reason: {
      type: DataTypes.STRING(100),
      allowNull: true
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
    tableName: 't_enterprise_fund_credit',
    chineseTableName:"企业-资金方授信状态表",
    chineseFieldName: {
      fund_org_code: "资金方平台机构编码",
      asset_org_code: "资产方平台机构编码",
      borrow_business_license: "企业营业执照号",
      fund_credit_status: "资金方授信状态",
      fund_credit_fee: "资金方授信金额",
      fund_credit_refuse_reason: "授信决绝原因",
      fund_receive_mode: "资金方接收数据模式",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
