/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    't_order_withdraw',
    {
      order_no: {
        type: DataTypes.STRING(60),
        allowNull: false,
        primaryKey: true,
      },
      withdraw_status: {
        type: DataTypes.CHAR(3),
        allowNull: true,
        defaultValue: '001',
      },
      withdraw_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      finish_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      desc: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      rx_insertTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      rx_updateTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 't_order_withdraw',
    },
  );
};
