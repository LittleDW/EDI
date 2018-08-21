/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_order_service', {
    order_no: {
      type: DataTypes.STRING(60),
      allowNull: false,
      primaryKey: true
    },
    service_date: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true
    },
    service_fee: {
      type: DataTypes.BIGINT,
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
    tableName: 't_order_service',
    chineseTableName:"订单服务费详情",
    chineseFieldName: {
      order_no: "平台订单号",
      service_date: "兑付日",
      service_fee: "服务费",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
