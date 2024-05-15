"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionItemModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TransactionItemModel.init(
    {
      customerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      discountAmount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      price: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      quantity: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      totalAmount: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      craetedBy: {
        allowNull: false,
        type: DataTypes.INTEGER,
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
      modelName: "TransactionItemModel",
      tableName: "TransactionItems",
    }
  );
  return TransactionItemModel;
};
