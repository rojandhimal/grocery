"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("StockImports", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      billNumber: {
        type: String,
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
      remarks: {
        type: Sequelize.TEXT,
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
      totalAmount: {
        type: Sequelize.DOUBLE,
        defaultValue: 1,
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
    await queryInterface.dropTable("StockImports");
  },
};
