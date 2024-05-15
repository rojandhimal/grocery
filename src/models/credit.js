"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CreditModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CreditModel.belongsTo(models.UserModel, {
        foreignKey: "createdBy",
      });
      CreditModel.belongsTo(models.UserModel, {
        foreignKey: "updatedBy",
      });
      CreditModel.belongsTo(models.CustomerModel, {
        foreignKey: "customerId",
      });
      CreditModel.hasMany(models.CreditLogModel, {
        foreignKey: "creditId",
        as: "creditHistory",
      });
    }
  }
  CreditModel.init(
    {
      customerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      totalAmount: {
        allowNull: false,
        type: DataTypes.DOUBLE,
        defaultValue: 0,
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
      modelName: "CreditModel",
      tableName: "Credits",
    }
  );
  return CreditModel;
};
