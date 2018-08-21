/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_deadline', {
    deadline_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    deadline_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    deadline_desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    from: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    to: {
      type: DataTypes.INTEGER(11),
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
    tableName: 't_deadline',
    chineseTableName:"【基础信息】-期限",
    chineseFieldName: {
      deadline_id: "期限编码",
      deadline_name: "期限名称",
      deadline_desc: "期限描述",
      from: "开始",
      to: "结束",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
