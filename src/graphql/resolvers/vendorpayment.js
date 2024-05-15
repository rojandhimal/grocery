// ./graphql/resolvers/VendorPayment.js
const {
  StockImportModel,
  StockModel,
  VendorPaymentModel,
  UserModel,
  VendorModel,
} = require("../../models");
const { Op } = require("sequelize");
const { GraphQLUpload } = require("graphql-upload");

const { createTransaction } = require("../../utils/transaction");

/** Query Functions */
const vendorPayment = async (parent, input, context) => {
  try {
    const { id } = input;
    // Fetch a VendorPayment by ID
    const foundVendorPayment = await VendorPaymentModel.findOne({
      include: [
        { model: UserModel },
        { model: UserModel },
        { model: VendorModel, as: "vendor" },
        {
          model: StockImportModel,
          as: "stockImport",
          include: [{ model: StockModel, as: "stockItems" }],
        },
      ],
      where: { id },
    });

    // Check if the VendorPayment is not found
    if (!foundVendorPayment) {
      throw new Error(`VendorPayment with ID ${id} not found`);
    }
    return {
      success: true,
      vendorPayment: foundVendorPayment,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING VENDOR PAYMENT ***", error);
    return {
      error,
      success: false,
    };
  }
};

const vendorPayments = async (parent, { input }, context) => {
  // Fetch all VendorPayments
  const { limit, offset = 0, search } = input || {};
  try {
    const where = {};
    if (search) {
      where.name = { [Op.substring]: search };
    }

    const edges = await VendorPaymentModel.findAll({
      include: [
        { model: UserModel },
        { model: UserModel },
        { model: VendorModel, as: "vendor" },
      ],
      context,
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    const count = await VendorPaymentModel.count({ context, where });

    return {
      count,
      edges,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING VENDOR PAYMENTS ***", error);
    return {
      error,
    };
  }
};

/** Mutation Functions */
const createVendorPayment = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { name } = input;
    // Check if the name is unique before creating a new name
    const existingVendorPayment = await VendorPaymentModel.findOne({
      where: { name },
    });
    if (existingVendorPayment) {
      throw new Error("VendorPayment name already in use");
    }

    const payload = { name };

    const newVendorPayment = await VendorPaymentModel.create(payload, {
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      VendorPayment: VendorPaymentModel.findOne({
        where: { id: newVendorPayment.id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const updateVendorPayment = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { id, image, ...updateFields } = input; // Replace with the actual user ID you want to update
    const VendorPayment = await VendorPaymentModel.findByPk(id);
    if (!VendorPayment) {
      throw new Error("VendorPayment not found.");
    }

    // Perform the partial update
    await VendorPaymentModel.update(updateFields, {
      where: { id },
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      VendorPayment: await VendorPaymentModel.findOne({
        where: { id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const deleteVendorPayment = async (parent, { input }, context) => {
  try {
    const { id } = input;
    // Fetch a VendorPayment by ID
    const foundVendorPayment = await VendorPaymentModel.findByPk(id);

    // Check if the VendorPayment is not found
    if (!foundVendorPayment) {
      throw new Error(`VendorPayment with ID ${id} not found`);
    }
    await foundVendorPayment.destroy();
    return { success: true, VendorPayment: foundVendorPayment };
  } catch (error) {
    console.log("*** ERROR DELETING VENDOR PAYMENT ***", error);
    return {
      success: false,
      error,
    };
  }
};

module.exports = {
  Upload: GraphQLUpload,
  Mutation: {
    createVendorPayment,
    updateVendorPayment,
    deleteVendorPayment,
  },
  Query: {
    vendorPayment,
    vendorPayments,
  },
};
