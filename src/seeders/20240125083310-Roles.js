"use strict";
const models = require("../models"); //import models

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const admin = await models.RoleModel.findOne({
      where: { name: "ADMIN" },
    });
    if (!admin)
      await models.RoleModel.create({
        name: "ADMIN",
      });

    const manager = await models.RoleModel.findOne({
      where: { name: "MANAGER" },
    });
    if (!manager)
      await models.RoleModel.create({
        name: "MANAGER",
      });
    const buyer = await models.RoleModel.findOne({
      where: { name: "SELLER" },
    });
    if (!buyer)
      await models.RoleModel.create({
        name: "SELLER",
      });
  },

  async down(queryInterface, Sequelize) {
    await models.RoleModel.destroy({
      where: {
        name: "ADMIN",
      },
    });

    await models.RoleModel.destroy({
      where: {
        name: "MANAGER",
      },
    });

    await models.RoleModel.destroy({
      where: {
        name: "SELLER",
      },
    });
  },
};
