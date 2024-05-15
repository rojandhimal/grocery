"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RoleModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RoleModel.init(
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        DataTypes: 0,
      },
    },
    {
      sequelize,
      modelName: "RoleModel",
      tableName: "Roles",
      timestamps: true,
    }
  );
  return RoleModel;
};
