/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_role_func', {
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    role_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    func_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    func_flag: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    use_yn: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'N'
    },
    create_user_id: {
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
    tableName: 't_role_func',
    chineseTableName:"系统角色对应的菜单权限",
    chineseFieldName: {
      id: "ID",
      role_id: "角色ID",
      func_id: "角色菜单ID",
      func_flag: "角色菜单Flag",
      use_yn: "是否启用",
      create_user_id: "创建人",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
