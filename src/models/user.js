"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserModel.belongsTo(models.RoleModel, {
        foreignKey: "roleId",
        as: "role",
      });
    }
  }
  UserModel.init(
    {
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactNumber: {
        unique: true,
        type: DataTypes.STRING,
      },
      dateOfBirth: {
        type: DataTypes.INTEGER,
      },
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
      },
      gender: DataTypes.STRING,
      isActive: DataTypes.STRING,
      isVerified: DataTypes.BOOLEAN,
      name: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      password: DataTypes.STRING,
      profileUrl: DataTypes.INTEGER,
      roleId: DataTypes.INTEGER,
      requestPasswordChange: DataTypes.STRING,
      resetToken: DataTypes.STRING,
      tokenExpireAt: DataTypes.DATE,
      username: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
      verificationToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UserModel",
      tableName: "Users",
    }
  );
  UserModel.beforeSave(async (user, options) => {
    if (user.username) {
      user.username = user.username.toLowerCase();
    }
  });
  return UserModel;
};
