// ./graphql/resolvers/customer.js
const { CustomerModel, CreditModel, CreditLogModel } = require("../../models");
const { Op } = require("sequelize");
const { GraphQLUpload } = require("graphql-upload");

const { createTransaction } = require("../../utils/transaction");

/** Query Functions */
const customer = async (parent, input, context) => {
  try {
    const { id } = input;
    // Fetch a customer by ID
    const foundCustomer = await CustomerModel.findOne({
      include: [
        {
          model: CreditModel,
          as: "credit",
          include: [{ model: CreditLogModel, as: "creditHistory" }],
        },
      ],
      where: { id },
    });

    // Check if the customer is not found
    if (!foundCustomer) {
      throw new Error(`customer with ID ${id} not found`);
    }
    return {
      success: true,
      customer: foundCustomer,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING CUSTOMER ***", error);
    return {
      error,
      success: false,
    };
  }
};

const customers = async (parent, { input }, context) => {
  // Fetch all customers
  const { limit, offset = 0, search } = input || {};
  try {
    const where = {};
    if (search) {
      where.name = { [Op.substring]: search };
    }

    const edges = await CustomerModel.findAll({
      context,
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    const count = await CustomerModel.count({ context, where });

    return {
      count,
      edges,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING CUSTOMERS ***", error);
    return {
      error,
    };
  }
};

/** Mutation Functions */
const createCustomer = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { profileUrl, name, gender, contactNumber, address } = input;
    const { user } = context;
    // Check if the name is unique before creating a new name
    const existingCustomer = await CustomerModel.findOne({
      where: { name },
    });
    if (existingCustomer) {
      throw new Error("Customer name already in use");
    }

    const payload = {
      profileUrl,
      name,
      gender,
      contactNumber,
      address,
      createdBy: user.id,
    };
    const newCustomer = await CustomerModel.create(payload, { transaction });
    await transaction.commit();
    return {
      success: true,
      customer: CustomerModel.findOne({
        where: { id: newCustomer.id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const updateCustomer = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { id, ...updateFields } = input; // Replace with the actual user ID you want to update
    const customer = await CustomerModel.findByPk(id);
    if (!customer) {
      throw new Error("Customer not found.");
    }

    // Perform the partial update
    await CustomerModel.update(updateFields, {
      where: { id },
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      customer: await CustomerModel.findOne({
        where: { id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const deleteCustomer = async (parent, { input }, context) => {
  try {
    const { id } = input;
    // Fetch a customer by ID
    const foundCustomer = await CustomerModel.findByPk(id);

    // Check if the customer is not found
    if (!foundCustomer) {
      throw new Error(`customer with ID ${id} not found`);
    }
    await foundCustomer.destroy();
    return { success: true, customer: foundCustomer };
  } catch (error) {
    console.log("*** ERROR DELETING CUSTOMER ***", error);
    return {
      success: false,
      error,
    };
  }
};

module.exports = {
  Upload: GraphQLUpload,
  Mutation: {
    createCustomer,
    updateCustomer,
    deleteCustomer,
  },
  Query: {
    customer,
    customers,
  },
};
