"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductModel.belongsTo(models.BrandModel, {
        foreignKey: "brandId",
        as: "brand",
      });
      ProductModel.belongsTo(models.UserModel, {
        foreignKey: "createdBy",
      });
      ProductModel.belongsTo(models.UserModel, {
        foreignKey: "updatedBy",
      });

      ProductModel.hasMany(models.ProductCategoryModel, {
        foreignKey: "productId",
        as: "categories",
      });
      ProductModel.hasMany(models.ProductImageModel, {
        foreignKey: "productId",
        as: "images",
      });
    }
  }
  ProductModel.init(
    {
      brandId: {
        type: DataTypes.INTEGER,
      },
      createdBy: {
        type: DataTypes.INTEGER,
      },
      description: {
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      price: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.TEXT,
      },
      stockUnit: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "ProductModel",
      tableName: "Products",
    }
  );
  return ProductModel;
};
