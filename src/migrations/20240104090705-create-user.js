"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dateOfBirth: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gender: {
        type: Sequelize.STRING,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
      },
      lastActive: {
        type: Sequelize.DATE,
      },
      roleId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Roles", // The name of the referenced table
          key: "id", // The name of the referenced column
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      profileUrl: {
        type: Sequelize.TEXT,
      },
      password: {
        type: Sequelize.STRING,
      },
      requestPasswordChange: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
      },
      resetToken: {
        type: Sequelize.STRING,
      },
      tokenExpireAt: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      verificationToken: {
        type: Sequelize.STRING,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
