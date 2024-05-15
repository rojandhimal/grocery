// ./graphql/resolvers/stock.js
const {
  ProductModel,
  StockModel,
  UserModel,
  VendorModel,
} = require("../../models");
const { Op } = require("sequelize");
const { GraphQLUpload } = require("graphql-upload");

const { createTransaction } = require("../../utils/transaction");

/** Query Functions */
const stock = async (parent, input, context) => {
  try {
    const { id } = input;
    // Fetch a stock by ID
    const foundStock = await StockModel.findOne({
      include: [
        { model: UserModel },
        { model: UserModel },
        { model: VendorModel, as: "vendor" },
        { model: ProductModel, as: "product" },
      ],
      where: { id },
    });

    // Check if the stock is not found
    if (!foundStock) {
      throw new Error(`stock with ID ${id} not found`);
    }
    return {
      success: true,
      stock: foundStock,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING STOCK ***", error);
    return {
      error,
      success: false,
    };
  }
};

const stocks = async (parent, { input }, context) => {
  // Fetch all stocks
  const { limit, offset = 0, search } = input || {};
  try {
    const where = {};
    if (search) {
      where.name = { [Op.substring]: search };
    }

    const edges = await StockModel.findAll({
      include: [
        { model: UserModel },
        { model: UserModel },
        { model: VendorModel, as: "vendor" },
        { model: ProductModel, as: "product" },
      ],
      context,
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    const count = await StockModel.count({ context, where });

    return {
      count,
      edges,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING STOCKS ***", error);
    return {
      error,
    };
  }
};

/** Mutation Functions */
const createStock = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { name, image } = input;
    // Check if the name is unique before creating a new name
    const existingStock = await StockModel.findOne({
      where: { name },
    });
    if (existingStock) {
      throw new Error("Stock name already in use");
    }

    const payload = { name };
    const newStock = await StockModel.create(payload, { transaction });
    await transaction.commit();
    return {
      success: true,
      stock: StockModel.findOne({
        where: { id: newStock.id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const updateStock = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { id, image, ...updateFields } = input; // Replace with the actual user ID you want to update
    const stock = await StockModel.findByPk(id);
    if (!stock) {
      throw new Error("Stock not found.");
    }

    // Perform the partial update
    await StockModel.update(updateFields, {
      where: { id },
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      stock: await StockModel.findOne({
        where: { id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const deleteStock = async (parent, { input }, context) => {
  try {
    const { id } = input;
    // Fetch a stock by ID
    const foundStock = await StockModel.findByPk(id);

    // Check if the stock is not found
    if (!foundStock) {
      throw new Error(`stock with ID ${id} not found`);
    }
    await foundStock.destroy();
    return { success: true, stock: foundStock };
  } catch (error) {
    console.log("*** ERROR DELETING STOCK ***", error);
    return {
      success: false,
      error,
    };
  }
};

module.exports = {
  Upload: GraphQLUpload,
  Mutation: {
    createStock,
    updateStock,
    deleteStock,
  },
  Query: {
    stock,
    stocks,
  },
};
