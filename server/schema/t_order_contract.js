/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_order_contract', {
    order_no: {
      type: DataTypes.STRING(60),
      allowNull: false,
      primaryKey: true
    },
    contract_type: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      primaryKey: true
    },
    contract_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    contract_url: {
      type: DataTypes.STRING(500),
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
    tableName: 't_order_contract',
    chineseTableName:"订单合同",
    chineseFieldName: {
      order_no: "平台订单号",
      contract_type: "合同类型",
      contract_number: "合同号",
      contract_url: "合同URL",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
