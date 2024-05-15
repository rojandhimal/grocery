// ./graphql/resolvers/brand.js
const { BrandModel } = require("../../models");
const { Op } = require("sequelize");
const { GraphQLUpload } = require("graphql-upload");

const { createTransaction } = require("../../utils/transaction");

/** Query Functions */
const brand = async (parent, input, context) => {
  try {
    const { id } = input;
    // Fetch a brand by ID
    const foundBrand = await BrandModel.findOne({
      where: { id },
    });

    // Check if the brand is not found
    if (!foundBrand) {
      throw new Error(`brand with ID ${id} not found`);
    }
    return {
      success: true,
      brand: foundBrand,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING BRAND ***", error);
    return {
      error,
      success: false,
    };
  }
};

const brands = async (parent, { input }, context) => {
  // Fetch all brands
  const { limit, offset = 0, search } = input || {};
  try {
    const where = {};
    if (search) {
      where.name = { [Op.substring]: search };
    }

    const edges = await BrandModel.findAll({
      context,
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    const count = await BrandModel.count({ context, where });

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
const createBrand = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { name, image } = input;
    // Check if the name is unique before creating a new name
    const existingBrand = await BrandModel.findOne({
      where: { name },
    });
    if (existingBrand) {
      throw new Error("Brand name already in use");
    }

    const payload = { name };
    const newBrand = await BrandModel.create(payload, { transaction });
    await transaction.commit();
    return {
      success: true,
      brand: BrandModel.findOne({
        where: { id: newBrand.id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const updateBrand = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { id, image, ...updateFields } = input; // Replace with the actual user ID you want to update
    const brand = await BrandModel.findByPk(id);
    if (!brand) {
      throw new Error("Brand not found.");
    }

    // Perform the partial update
    await BrandModel.update(updateFields, {
      where: { id },
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      brand: await BrandModel.findOne({
        where: { id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const deleteBrand = async (parent, { input }, context) => {
  try {
    const { id } = input;
    // Fetch a brand by ID
    const foundBrand = await BrandModel.findByPk(id);

    // Check if the brand is not found
    if (!foundBrand) {
      throw new Error(`brand with ID ${id} not found`);
    }
    await foundBrand.destroy();
    return { success: true, brand: foundBrand };
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
    createBrand,
    updateBrand,
    deleteBrand,
  },
  Query: {
    brand,
    brands,
  },
};
