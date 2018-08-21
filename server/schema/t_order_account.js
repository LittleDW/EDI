/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_order_account', {
    order_no: {
      type: DataTypes.STRING(60),
      allowNull: false,
      primaryKey: true
    },
    fund_org_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fund_order_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    product_rate: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    account_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    account_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    real_gathering_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    real_gathering_bank: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    real_gathering_card_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    repayment_card_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    repayment_bank: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    repayment_name: {
      type: DataTypes.STRING(50),
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
    tableName: 't_order_account',
    chineseTableName:"订单出账明细",
    chineseFieldName: {
      order_no: "平台订单号",
      fund_org_code: "资金方机构号",
      fund_order_no: "资金方订单号",
      product_rate: "产品利率",
      account_fee: "出账金额",
      account_date: "出账日期",
      real_gathering_name: "放款户名",
      real_gathering_bank: "放款开户行",
      real_gathering_card_no: "放款账户",
      repayment_card_no: "兑付账户",
      repayment_bank: "兑付开户行",
      repayment_name: "兑付户名",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
