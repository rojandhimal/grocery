"use strict";
const bcrypt = require("bcrypt");
const models = require("../models"); //import models
const { Op } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create a admin user
    let user = await models.UserModel.findOne({
      where: {
        [Op.or]: [
          { email: process.env.ADMIN_USERNAME },
          { username: process.env.ADMIN_USERNAME },
        ],
      },
    });
    if (!user) {
      user = await models.UserModel.create({
        name: "Super User",
        username: process.env.ADMIN_USERNAME,
        contactNumber: process.env.ADMIN_CONTACT_NUMBER,
        isActive: 1,
        email: process.env.ADMIN_EMAIL, // Set unique email for each user
        password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
        email_verified: 1,
        isVerified: 1,
        address: "Damak, Jhapa",
        // Other fields you want to set for the user
      });
    }
    const admin = await models.RoleModel.findOne({ where: { name: "ADMIN" } });
    if (admin) {
      await user.update({ roleId: admin.id });
    }
  },

  async down(queryInterface, Sequelize) {
    // Add commands to revert seed here
    await models.UserModel.destroy({
      where: { email: process.env.ADMIN_EMAIL },
    });
  },
};
