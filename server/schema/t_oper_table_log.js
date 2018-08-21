/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_oper_table_log', {
    oper_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    from_table: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    from_org_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    create_user_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    sub_user_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    action_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    oper_log: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    oper_time: {
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
    }
  }, {
    tableName: 't_oper_table_log',
    chineseTableName:"用户表操作日志",
    chineseFieldName: {
      oper_id: "操作ID",
      from_table: "操作表",
      from_org_code: "机构编码",
      create_user_id: "创建主用户",
      sub_user_id: "创建子用户",
      action_type: "动作类型",
      oper_log: "LOG",
      oper_time: "操作时间",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
