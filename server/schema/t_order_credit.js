/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_order_credit', {
    order_no: {
      type: DataTypes.STRING(60),
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
    tableName: 't_order_credit',
    chineseTableName:"订单授信信息",
    chineseFieldName: {
      order_no: "平台订单号",
      credit_org: "授权机构",
      credit_result: "授信结果",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
