"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StockModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StockModel.belongsTo(models.UserModel, {
        foreignKey: "updatedBy",
      });
      StockModel.belongsTo(models.UserModel, {
        foreignKey: "createdBy",
      });
      StockModel.belongsTo(models.ProductModel, {
        foreignKey: "productId",
        as: "product",
      });
      StockModel.belongsTo(models.VendorModel, {
        foreignKey: "vendorId",
        as: "vendor",
      });
    }
  }
  StockModel.init(
    {
      costPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      stockImportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mrp: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sellingPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
      },
      vendorId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "StockModel",
      tableName: "Stocks",
    }
  );
  return StockModel;
};
