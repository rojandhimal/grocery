"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VendorModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      VendorModel.belongsTo(models.UserModel, {
        foreignKey: "updatedBy",
      });
      VendorModel.belongsTo(models.UserModel, {
        foreignKey: "createdBy",
      });
    }
  }
  VendorModel.init(
    {
      address: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      contactNumber: DataTypes.STRING,
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      salesPersonName: {
        type: DataTypes.STRING,
      },
      salesPersonContactNumber: DataTypes.STRING,
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
      },

      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
      profileUrl: {
        type: DataTypes.TEXT,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "VendorModel",
      tableName: "Vendors",
    }
  );
  return VendorModel;
};
