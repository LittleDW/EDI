/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_finance_asset_repayment', {
    repayment_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    asset_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    request_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    repayment_start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    repayment_end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    repayment_principal_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    repayment_interest_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    repayment_total_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    repayment_status: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    repayment_file_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    remark: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    rx_insertTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rx_updateTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 't_finance_asset_repayment'
  });
};
