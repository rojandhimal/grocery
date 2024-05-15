"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductImageModel extends Model {
    static associate(models) {
      ProductImageModel.belongsTo(models.ProductModel, {
        foreignKey: "ProductId",
        as: "Product",
      });
    }
  }

  ProductImageModel.init(
    {
      url: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      productId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "ProductImageModel",
      tableName: "ProductImages",
    }
  );

  return ProductImageModel;
};
