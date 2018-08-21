/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_after_repayment_order', {
    after_repayment_order_no: {
      type: DataTypes.STRING(60),
      allowNull: false,
      primaryKey: true
    },
    asset_org_code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    order_status: {
      type: DataTypes.STRING(3),
      allowNull: true,
      defaultValue: '001'
    },
    total_number_of_repayments: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    remaining_total_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    paid_up_total_fee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    detail_file_url: {
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
    tableName: 't_after_repayment_order'
  });
};
