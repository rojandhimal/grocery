"use strict";
const { Model } = require("sequelize");
const { notificationTypes } = require("../constant/enum/notification");
module.exports = (sequelize, DataTypes) => {
  class NotificationModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NotificationModel.init(
    {
      attachment: DataTypes.STRING,
      description: DataTypes.STRING,
      meta: DataTypes.JSON,
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
      isMarkedRead: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
      targetedGroup: {
        allowNull: false,
        type: DataTypes.STRING,
        defaultValue: "ADMIN",
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING,
        defaultValue: notificationTypes.GENERAL,
      },
      notifyTo: {
        type: DataTypes.INTEGER,
      },
      createdBy: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "NotificationModel",
      tableName: "Notifications",
    }
  );
  return NotificationModel;
};
