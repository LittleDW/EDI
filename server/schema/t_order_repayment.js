/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_order_repayment', {
    order_no: {
      type: DataTypes.STRING(60),
      allowNull: false,
      primaryKey: true
    },
    repayment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true
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
    repayment_original_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    repayment_interest_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    repayment_end_date: {
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
    tableName: 't_order_repayment',
    chineseTableName:"订单兑付详情",
    chineseFieldName: {
      order_no: "平台订单号",
      repayment_date: "兑付日",
      repayment_card_no: "兑付账户",
      repayment_bank: "兑付开户行",
      repayment_name: "兑付户名",
      repayment_original_fee: "兑付本金",
      repayment_interest_fee: "兑付利息",
      repayment_end_date: "兑付到期日",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
