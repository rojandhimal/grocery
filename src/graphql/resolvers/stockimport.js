// ./graphql/resolvers/stockImport.js
const {
  ProductModel,
  StockImportModel,
  StockModel,
  UserModel,
  VendorModel,
  VendorPaymentModel,
} = require("../../models");
const { Op } = require("sequelize");
const { GraphQLUpload } = require("graphql-upload");

const { createTransaction } = require("../../utils/transaction");

/** Query Functions */
const stockImport = async (parent, input, context) => {
  try {
    const { id } = input;
    // Fetch a stockImport by ID
    const foundStockImport = await StockImportModel.findOne({
      include: [
        { model: UserModel },
        { model: UserModel },
        { model: VendorModel, as: "vendor" },
        { model: StockModel, as: "stockItems" },
        { model: VendorPaymentModel, as: "payments" },
      ],
      where: { id },
    });

    // Check if the stockImport is not found
    if (!foundStockImport) {
      throw new Error(`stockImport with ID ${id} not found`);
    }
    return {
      success: true,
      stockImport: foundStockImport,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING STOCK IMPORT ***", error);
    return {
      error,
      success: false,
    };
  }
};

const stockImports = async (parent, { input }, context) => {
  // Fetch all stockImports
  const { limit, offset = 0, search } = input || {};
  try {
    const where = {};
    if (search) {
      where.name = { [Op.substring]: search };
    }

    const edges = await StockImportModel.findAll({
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
    const count = await StockImportModel.count({
      context,
      where,
    });

    return {
      count,
      edges,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING STOCK IMPORTS ***", error);
    return {
      error,
    };
  }
};

/** Mutation Functions */
const createStockImport = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const {
      billNumber,
      remarks,
      vendorId,
      totalAmount,
      stockItems = [],
      payment,
    } = input;
    const { user } = context;
    if (!stockItems.length) {
      throw new Error("Please add stock import products.");
    }
    if (!vendorId) {
      throw new Error("Please provide vendor information.");
    }
    if (!payment) {
      throw new Error("Please add payment information.");
    }
    // Check if the name is unique before creating a new name
    const payload = {
      billNumber,
      remarks,
      vendorId,
      totalAmount,
      createdBy: user.id,
    };

    const newStockImport = await StockImportModel.create(payload, {
      transaction,
    });
    for (const item of stockItems) {
      const foundProduct = await ProductModel.findByPk(item.productId);
      if (!foundProduct) {
        throw new Error("Import product not available.");
      }
      await StockModel.create(
        {
          ...item,
          stockImportId: newStockImport.id,
          createdBy: user.id,
          vendorId,
        },
        { transaction }
      );
      const stockUnit = (foundProduct.toJSON().stockUnit || 0) + item.quantity;
      await foundProduct.update(
        { stockUnit, price: item.sellingPrice },
        { transaction }
      );
    }
    await VendorPaymentModel.create(
      {
        ...payment,
        createdBy: user.id,
        vendorId,
        stockImportId: newStockImport.id,
      },
      { transaction }
    );
    await transaction.commit();
    return {
      success: true,
      stockImport: StockImportModel.findOne({
        where: { id: newStockImport.id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const updateStockImport = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { id, image, ...updateFields } = input; // Replace with the actual user ID you want to update
    const stockImport = await StockImportModel.findByPk(id);
    if (!stockImport) {
      throw new Error("StockImport not found.");
    }

    // Perform the partial update
    await StockImportModel.update(updateFields, {
      where: { id },
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      stockImport: await StockImportModel.findOne({
        where: { id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const deleteStockImport = async (parent, { input }, context) => {
  try {
    const { id } = input;
    // Fetch a stockImport by ID
    const foundStockImport = await StockImportModel.findByPk(id);

    // Check if the stockImport is not found
    if (!foundStockImport) {
      throw new Error(`stockImport with ID ${id} not found`);
    }
    await foundStockImport.destroy();
    return { success: true, stockImport: foundStockImport };
  } catch (error) {
    console.log("*** ERROR DELETING STOCK IMPORT ***", error);
    return {
      success: false,
      error,
    };
  }
};

module.exports = {
  Upload: GraphQLUpload,
  Mutation: {
    createStockImport,
    updateStockImport,
    deleteStockImport,
  },
  Query: {
    stockImport,
    stockImports,
  },
};
