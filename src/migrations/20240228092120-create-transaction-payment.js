"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TransactionPayments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      customerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Customers", // The name of the referenced table
          key: "id", // The name of the referenced column
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
      },
      billNumber: {
        type: Sequelize.STRING,
      },
      dueAmount: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
      },
      method: {
        type: Sequelize.STRING,
      },
      remarks: {
        type: Sequelize.STRING,
      },
      transactionId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Transactions", // The name of the referenced table
          key: "id", // The name of the referenced column
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdBy: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Users", // The name of the referenced table
          key: "id", // The name of the referenced column
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("TransactionPayments");
  },
};
