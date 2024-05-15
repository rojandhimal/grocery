"use strict";
const { Model } = require("sequelize");
const {
  paymentMehotdTypes,
  paymentStatus,
} = require("../constant/enum/vendor");
module.exports = (sequelize, DataTypes) => {
  class VendorPaymentModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      VendorPaymentModel.belongsTo(models.UserModel, {
        foreignKey: "updatedBy",
      });
      VendorPaymentModel.belongsTo(models.UserModel, {
        foreignKey: "createdBy",
      });
      VendorPaymentModel.belongsTo(models.VendorModel, {
        foreignKey: "vendorId",
        as: "vendor",
      });
      VendorPaymentModel.belongsTo(models.StockImportModel, {
        foreignKey: "stockImportId",
        as: "stockImport",
      });
    }
  }
  VendorPaymentModel.init(
    {
      accountHolderName: {
        type: DataTypes.STRING,
      },
      bankName: {
        type: DataTypes.STRING,
      },
      chequeNumber: {
        type: DataTypes.STRING,
      },
      chequeDate: {
        type: DataTypes.DATE,
      },
      chequeRecievedBy: {
        type: DataTypes.STRING,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stockImportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING,
        defaultValue: paymentMehotdTypes.CASH,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: paymentStatus.COMPLETED,
      },
      totalAmount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.STRING,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
      },
      vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "VendorPaymentModel",
      tableName: "VendorPayments",
    }
  );
  return VendorPaymentModel;
};
