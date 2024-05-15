"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionPaymentModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TransactionPaymentModel.init(
    {
      craetedBy: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      customerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      amount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      billNumber: {
        type: DataTypes.STRING,
      },
      dueAmount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      method: {
        type: DataTypes.STRING,
      },
      remarks: {
        type: DataTypes.STRING,
      },

      transactionId: {
        type: DataTypes.INTEGER,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "TransactionPaymentModel",
      tableName: "TransactionPayments",
    }
  );
  return TransactionPaymentModel;
};
