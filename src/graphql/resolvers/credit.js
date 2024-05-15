// ./graphql/resolvers/credit.js
const { CreditLogModel, CreditModel } = require("../../models");
const { Op } = require("sequelize");

const { createTransaction } = require("../../utils/transaction");

/** Query Functions */
const credit = async (parent, input, context) => {
  try {
    const { customerId } = input;
    // Fetch a credit by ID
    const foundCredit = await CreditModel.findOne({
      include: [{ model: CreditLogModel, as: "creditHistory" }],
      where: { customerId },
    });

    // Check if the credit is not found
    if (!foundCredit) {
      throw new Error(`credit with ID ${id} not found`);
    }
    return {
      success: true,
      credit: foundCredit,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING CREDIT ***", error);
    return {
      error,
      success: false,
    };
  }
};

const credits = async (parent, { input }, context) => {
  // Fetch all credits
  const { limit, offset = 0, search } = input || {};
  try {
    const where = {};
    if (search) {
      where.name = { [Op.substring]: search };
    }

    const edges = await CreditModel.findAll({
      context,
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    const count = await CreditModel.count({ context, where });

    return {
      count,
      edges,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING CREDITS ***", error);
    return {
      error,
    };
  }
};

/** Mutation Functions */
const createCredit = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { customerId, amount } = input;
    const { user } = context;
    if (!amount) {
      throw new Error("Credit amount must be greater than zero.");
    }
    // Check if the name is unique before creating a new name
    let existingCredit = await CreditModel.findOne({
      where: { customerId },
    });
    let totalAmount = amount;
    let oldAmount = 0;
    if (existingCredit) {
      const theCredit = await existingCredit.toJSON();
      oldAmount = theCredit.totalAmount;
      totalAmount = oldAmount + amount;
      await existingCredit.update(
        { totalAmount, updatedBy: user.id },
        { transaction }
      );
    } else {
      existingCredit = await CreditModel.create(
        { createdBy: user.id, customerId, totalAmount },
        { transaction }
      );
    }
    await CreditLogModel.create(
      {
        createdBy: user.id,
        amount,
        remarks: `credit amount ${amount} added on old ${oldAmount} and new credit amount is ${totalAmount}`,
        customerId,
      },
      { transaction }
    );
    await transaction.commit();
    return {
      success: true,
      credit: CreditModel.findOne({
        where: { id: existingCredit.id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const updateCredit = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { id, image, ...updateFields } = input; // Replace with the actual user ID you want to update
    const credit = await CreditModel.findByPk(id);
    if (!credit) {
      throw new Error("Credit not found.");
    }

    // Perform the partial update
    await CreditModel.update(updateFields, {
      where: { id },
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      credit: await CreditModel.findOne({
        where: { id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const clearCredit = async (parent, { input }, context) => {
  try {
    const { id } = input;
    // Fetch a credit by ID
    const foundCredit = await CreditModel.findByPk(id);

    // Check if the credit is not found
    if (!foundCredit) {
      throw new Error(`credit with ID ${id} not found`);
    }
    await foundCredit.update({ totalAmount: 0 });
    return { success: true, credit: foundCredit };
  } catch (error) {
    console.log("*** ERROR DELETING CREDIT ***", error);
    return {
      success: false,
      error,
    };
  }
};

module.exports = {
  Mutation: {
    createCredit,
    updateCredit,
    clearCredit,
  },
  Query: {
    credit,
    credits,
  },
};
