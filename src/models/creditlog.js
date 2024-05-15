"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CreditLogModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CreditLogModel.init(
    {
      creditId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      customerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      transactionId: {
        type: DataTypes.INTEGER,
      },
      amount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      remarks: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "CreditLogModel",
      tableName: "CreditLogs",
    }
  );
  return CreditLogModel;
};
