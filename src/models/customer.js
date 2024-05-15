"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CustomerModel extends Model {
    static associate(models) {
      // define association here
      CustomerModel.hasOne(models.CreditModel, {
        foreignKey: "customerId",
        as: "credit",
      });
    }
  }
  CustomerModel.init(
    {
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profileUrl: {
        type: DataTypes.STRING,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "CustomerModel",
      tableName: "Customers",
    }
  );
  return CustomerModel;
};
