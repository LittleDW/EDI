/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_org_mode', {
    org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    mode_type: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      primaryKey: true
    },
    mode_content: {
      type: DataTypes.TEXT,
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
    tableName: 't_org_mode',
    chineseTableName:"匹配模板",
    chineseFieldName: {
      order_no: "平台订单号",
      mode_type: "模板类型",
      mode_content: "内容",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
