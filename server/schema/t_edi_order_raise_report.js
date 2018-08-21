/* jshint indent: 2 */
const moment = require('moment');
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_edi_order_raise_report', {
    borrow_date: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    borrow_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    borrow_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    d_000: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    d_001: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    d_002: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    d_003: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    d_004: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    d_005: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    d_006: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    d_007: {
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
    tableName: 't_edi_order_raise_report',
    chineseTableName:"【统计汇总】-平规模统计（募集量）",
    chineseFieldName: {
      borrow_date: "借款日期",
      borrow_count: "借款笔数",
      borrow_fee: "借款金额",
      d_000: "d_000",
      d_001: "d_001",
      d_002: "d_002",
      d_003: "d_003",
      d_004: "d_004",
      d_005: "d_005",
      d_006: "d_006",
      d_007: "d_007",
      rx_insertTime: "创建时间",
      rx_updateTime: "更新时间"
    }
  });
};
