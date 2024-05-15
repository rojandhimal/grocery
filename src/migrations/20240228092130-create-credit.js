"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Credits", {
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
      totalAmount: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
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
    await queryInterface.dropTable("Credits");
  },
};
