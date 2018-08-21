/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_finance_target', {
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.CHAR(3),
      allowNull: false
    },
    target_no: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    date: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
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
    tableName: 't_finance_target',
    chineseTableName:"标的信息集合，用于参数有效性检测",
    chineseFieldName: {
      code: "主表Code",
      type: "信息所属",
      target_no: "标的号",
      date: "日期",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
