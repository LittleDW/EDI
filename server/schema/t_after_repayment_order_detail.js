/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_after_repayment_order_detail', {
    id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    after_repayment_order_no: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    loan_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    borrow_type: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    borrow_name: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    borrow_certificate_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    borrow_phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    is_substituted_for_payment: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    period_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    remaining_periods: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    remaining_total_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    remaining_principal_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    remaining_interest_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    current_balance: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_repayment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paid_up_total_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    paid_up_principal_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    paid_up_interest_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    prepayment_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    business_type: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    overdue_status: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    overdue_days: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    overdue_poundage: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    overdue_penalty: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    remark: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    rx_insertTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    rx_updateTime: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 't_after_repayment_order_detail'
  });
};
