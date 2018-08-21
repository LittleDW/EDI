/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_order_payment', {
    order_no: {
      type: DataTypes.STRING(60),
      allowNull: false,
      primaryKey: true
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    payment_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    payment_certificate_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    payment_channel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    payment_serial_no: {
      type: DataTypes.STRING(100),
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
    tableName: 't_order_payment',
    chineseTableName:"订单到账",
    chineseFieldName: {
      order_no: "平台订单号",
      payment_date: "到账日期",
      payment_fee: "到账金额",
      payment_certificate_url: "支付凭证地址",
      payment_channel: "支付渠道",
      payment_serial_no: "交易流水号",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
