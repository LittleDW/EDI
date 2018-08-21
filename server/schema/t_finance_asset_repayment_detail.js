/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_finance_asset_repayment_detail', {
    asset_order_no: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    asset_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    current_expected_repayment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true
    },
    is_canceled: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    repayment_code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    borrow_name: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    borrow_cid: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    borrow_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    business_type: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    loan_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    loan_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    borrow_end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    loan_period: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    annualized_interest_rate: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    expected_interest_total_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    service_rate: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    service_total_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    repayment_mode: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    principal_period_count: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    interest_period_count: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    service_fee_period_count: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    remaining_principal_period_count: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    remaining_interest_period_count: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    remaining_service_fee_period_count: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    actual_repayment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    current_expected_repayment_principal_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    current_expected_repayment_interest_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    current_expected_repayment_service_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    overdue_principal_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    overdue_interest_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    overdue_penalty_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    overdue_other_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    current_expected_repayment_total_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    actual_repayment_total_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    prepayment_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    prepayment_service_charge: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    is_compensated: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    overdue_status: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    days_overdue: {
      type: DataTypes.INTEGER(10),
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
    tableName: 't_finance_asset_repayment_detail'
  });
};
