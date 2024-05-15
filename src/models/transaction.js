"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TransactionModel.init(
    {
      amount: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      customerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      discountAmount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      totalAmount: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      craetedBy: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "TransactionModel",
      tableName: "Transactions",
    }
  );
  return TransactionModel;
};
