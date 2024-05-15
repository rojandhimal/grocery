"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StockImportModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StockImportModel.belongsTo(models.UserModel, {
        foreignKey: "updatedBy",
      });
      StockImportModel.belongsTo(models.UserModel, {
        foreignKey: "createdBy",
      });
      StockImportModel.belongsTo(models.VendorModel, {
        foreignKey: "vendorId",
        as: "vendor",
      });

      StockImportModel.hasMany(models.VendorPaymentModel, {
        foreignKey: "stockImportId",
        as: "payments",
      });
      StockImportModel.hasMany(models.StockModel, {
        foreignKey: "stockImportId",
        as: "stockItems",
      });
    }
  }
  StockImportModel.init(
    {
      billNumber: {
        type: DataTypes.STRING,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      remarks: {
        type: DataTypes.STRING,
      },
      vendorId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      totalAmount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "StockImportModel",
      tableName: "StockImports",
    }
  );
  return StockImportModel;
};
