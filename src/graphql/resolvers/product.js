// ./graphql/resolvers/product.js
const {
  ProductModel,
  ProductImageModel,
  ProductCategoryModel,
} = require("../../models");
const { Op } = require("sequelize");
const { GraphQLUpload } = require("graphql-upload");

const { createTransaction } = require("../../utils/transaction");

/** Query Functions */
const product = async (parent, input, context) => {
  try {
    const { id } = input;
    // Fetch a product by ID
    const foundProduct = await ProductModel.findOne({
      where: { id },
    });

    // Check if the product is not found
    if (!foundProduct) {
      throw new Error(`product with ID ${id} not found`);
    }
    return {
      success: true,
      product: foundProduct,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING PRODUCT ***", error);
    return {
      error,
      success: false,
    };
  }
};

const products = async (parent, { input }, context) => {
  // Fetch all products
  const { limit, offset = 0, search } = input || {};
  try {
    const where = {};
    if (search) {
      where.name = { [Op.substring]: search };
    }

    const edges = await ProductModel.findAll({
      context,
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    const count = await ProductModel.count({ context, where });

    return {
      count,
      edges,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING PRODUCTS ***", error);
    return {
      error,
    };
  }
};

/** Mutation Functions */
const createProduct = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const {
      brandId,
      categories = [],
      description,
      name,
      price,
      status,
      stockUnit,
      images = [],
    } = input;
    const { user } = context;

    // Check if the name is unique before creating a new name
    const existingProduct = await ProductModel.findOne({
      where: { name },
    });
    if (existingProduct) {
      throw new Error("Product name already in use");
    }

    const payload = {
      brandId,
      description,
      name,
      price,
      status,
      stockUnit,
      createdBy: user.id,
    };

    const newProduct = await ProductModel.create(payload, { transaction });
    for (let index = 0; index < array.length; index++) {
      await ProductCategoryModel.create(
        {
          productId: newProduct.id,
          categoryId: categories[index],
        },
        { transaction }
      );
    }
    for (let index = 0; index < array.length; index++) {
      await ProductImageModel.create(
        {
          productId: newProduct.id,
          categoryId: images[index],
        },
        { transaction }
      );
    }
    await transaction.commit();
    return {
      success: true,
      product: ProductModel.findOne({
        where: { id: newProduct.id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const updateProduct = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { id, images = [], categories = [], ...updateFields } = input; // Replace with the actual user ID you want to update
    const product = await ProductModel.findByPk(id);
    if (!product) {
      throw new Error("Product not found.");
    }
    if (images.length) {
      for (let index = 0; index < array.length; index++) {
        const productImage = await ProductImageModel.findOne({
          url: images[index],
          productId: id,
        });
        if (!productImage) {
          await ProductImageModel.create(
            { productId: id, url },
            { transaction }
          );
        }
      }
    }

    if (categories.length) {
      for (let index = 0; index < array.length; index++) {
        const productCategories = await ProductCategoryModel.findOne({
          url: images[index],
          productId: id,
        });
        if (!productCategories) {
          await ProductCategoryModel.create(
            { productId: id, url },
            { transaction }
          );
        }
      }
    }

    // Perform the partial update
    await ProductModel.update(updateFields, {
      where: { id },
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      product: await ProductModel.findOne({
        where: { id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const deleteProduct = async (parent, { input }, context) => {
  try {
    const { id } = input;
    // Fetch a product by ID
    const foundProduct = await ProductModel.findByPk(id);

    // Check if the product is not found
    if (!foundProduct) {
      throw new Error(`product with ID ${id} not found`);
    }
    await foundProduct.destroy();
    return { success: true, product: foundProduct };
  } catch (error) {
    console.log("*** ERROR DELETING PRODUCT ***", error);
    return {
      success: false,
      error,
    };
  }
};

module.exports = {
  Upload: GraphQLUpload,
  Mutation: {
    createProduct,
    updateProduct,
    deleteProduct,
  },
  Query: {
    product,
    products,
  },
};
