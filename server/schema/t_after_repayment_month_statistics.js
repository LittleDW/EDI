/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_after_repayment_month_statistics', {
    asset_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    fund_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    statistics_month: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    due_order_count: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
      defaultValue: '0'
    },
    due_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    paid_up_order_count: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
      defaultValue: '0'
    },
    paid_up_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    compensatory_order_count: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
      defaultValue: '0'
    },
    compensatory_fee: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0'
    },
    rx_insertTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    rx_updateTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 't_after_repayment_month_statistics'
  });
};
