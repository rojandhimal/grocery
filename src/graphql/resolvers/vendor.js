// ./graphql/resolvers/vendor.js
const { VendorModel, ImageModel } = require("../../models");
const { Op } = require("sequelize");
const { GraphQLUpload } = require("graphql-upload");

const { createTransaction } = require("../../utils/transaction");

/** Query Functions */
const vendor = async (parent, input, context) => {
  try {
    const { id } = input;
    // Fetch a vendor by ID
    const foundVendor = await VendorModel.findOne({
      where: { id },
    });

    // Check if the vendor is not found
    if (!foundVendor) {
      throw new Error(`vendor with ID ${id} not found`);
    }
    return {
      success: true,
      vendor: foundVendor,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING BRAND ***", error);
    return {
      error,
      success: false,
    };
  }
};

const vendors = async (parent, { input }, context) => {
  // Fetch all vendors
  const { limit, offset = 0, search } = input || {};
  try {
    const where = {};
    if (search) {
      where.name = { [Op.substring]: search };
    }

    const edges = await VendorModel.findAll({
      context,
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    const count = await VendorModel.count({ context, where });

    return {
      count,
      edges,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING BRANDS ***", error);
    return {
      error,
    };
  }
};

/** Mutation Functions */
const createVendor = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const {
      address,
      contactNumber,
      email,
      name,
      salesPersonContactNumber,
      salesPersonName,
    } = input;
    const { user } = context;
    // Check if the name is unique before creating a new name
    const existingVendor = await VendorModel.findOne({
      where: { name },
    });
    if (existingVendor) {
      throw new Error("Vendor name already in use");
    }

    const payload = {
      address,
      contactNumber,
      email,
      name,
      salesPersonContactNumber,
      salesPersonName,
      createdBy: user.id,
    };

    const newVendor = await VendorModel.create(payload, { transaction });
    await transaction.commit();
    return {
      success: true,
      vendor: VendorModel.findOne({
        where: { id: newVendor.id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const updateVendor = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { id, ...updateFields } = input; // Replace with the actual user ID you want to update
    const vendor = await VendorModel.findByPk(id);
    if (!vendor) {
      throw new Error("Vendor not found.");
    }

    // Perform the partial update
    await VendorModel.update(updateFields, {
      where: { id },
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      vendor: await VendorModel.findOne({
        where: { id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const deleteVendor = async (parent, { input }, context) => {
  try {
    const { id } = input;
    // Fetch a vendor by ID
    const foundVendor = await VendorModel.findByPk(id);

    // Check if the vendor is not found
    if (!foundVendor) {
      throw new Error(`vendor with ID ${id} not found`);
    }
    await foundVendor.destroy();
    return { success: true, vendor: foundVendor };
  } catch (error) {
    console.log("*** ERROR DELETING BRAND ***", error);
    return {
      success: false,
      error,
    };
  }
};

module.exports = {
  Upload: GraphQLUpload,
  Mutation: {
    createVendor,
    updateVendor,
    deleteVendor,
  },
  Query: {
    vendor,
    vendors,
  },
};
