"use strict";

const {
  paymentMehotdTypes,
  paymentStatus,
} = require("../constant/enum/vendor");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("VendorPayments", {
      bankName: {
        type: Sequelize.STRING,
      },
      accountHolderName: {
        type: Sequelize.STRING,
      },
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      chequeNumber: {
        type: Sequelize.STRING,
      },
      chequeDate: {
        type: Sequelize.DATE,
      },
      chequeRecievedBy: {
        type: Sequelize.STRING,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // The name of the referenced table
          key: "id", // The name of the referenced column
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      stockImportId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "StockImports", // The name of the referenced table
          key: "id", // The name of the referenced column
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      method: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: paymentMehotdTypes.CASH,
      },
      remarks: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: paymentStatus.COMPLETED,
      },
      totalAmount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 1,
      },
      transactionId: {
        type: Sequelize.STRING,
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users", // The name of the referenced table
          key: "id", // The name of the referenced column
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      vendorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Vendors", // The name of the referenced table
          key: "id", // The name of the referenced column
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("VendorPayments");
  },
};
