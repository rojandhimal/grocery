// transactionUtils.js
const { sequelize } = require("../models");

// Function to create a Sequelize transaction instance
async function createTransaction() {
  return await sequelize.transaction();
}

module.exports = { createTransaction };
