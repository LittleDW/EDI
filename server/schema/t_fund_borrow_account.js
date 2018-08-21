/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_fund_borrow_account', {
    fund_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    borrow_certificate_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    borrow_type: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    borrow_name: {
      type: DataTypes.STRING(200),
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
    borrow_card_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    account_time: {
      type: DataTypes.DATE,
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
    tableName: 't_fund_borrow_account',
    chineseTableName:"资金方借款人已开户信息",
    chineseFieldName: {
      fund_org_code: "资金方机构号",
      borrow_certificate_no: "借款人证件号",
      borrow_type: "借款类型",
      borrow_name: "借款人",
      borrow_phone: "借款人银行预留手机号",
      borrow_bank: "借款人开户行",
      borrow_card_no: "借款人银行卡号",
      account_time: "开户时间",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
