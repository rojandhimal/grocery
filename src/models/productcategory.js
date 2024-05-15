"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductCategoryModel extends Model {
    static associate(models) {
      ProductCategoryModel.belongsTo(models.ProductModel, {
        foreignKey: "productId",
        as: "Product",
      });
      ProductCategoryModel.belongsTo(models.CategoryModel, {
        foreignKey: "categoryId",
        as: "Category",
      });
    }
  }

  ProductCategoryModel.init(
    {
      categoryId: {
        allowNull: false,
        type: DataTypes.INTEGER,
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
      modelName: "ProductCategoryModel",
      tableName: "ProductCategories",
    }
  );

  return ProductCategoryModel;
};
