/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_order_advance', {
    order_no: {
      type: DataTypes.STRING(60),
      allowNull: false,
      primaryKey: true
    },
    advance_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    advance_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    advance_channel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    advance_serial_no: {
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
    tableName: 't_order_advance',
    chineseTableName:"订单垫资",
    chineseFieldName: {
      order_no: "平台订单号",
      advance_date: "垫资日期",
      advance_fee: "垫资金额",
      advance_channel: "垫款渠道",
      advance_serial_no: "垫款流水号",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
