"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BrandModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BrandModel.init(
    {
      logo: {
        type: DataTypes.TEXT,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "BrandModel",
      tableName: "Brands",
    }
  );
  return BrandModel;
};
