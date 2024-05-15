"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RolePermissionModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RolePermissionModel.init(
    {
      roleId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      permissionId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "RolePermissionModel",
      tableName: "Role_permissions",
    }
  );
  return RolePermissionModel;
};
