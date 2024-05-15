// ./graphql/resolvers/category.js
const { CategoryModel, ImageModel } = require("../../models");
const { Op } = require("sequelize");
const { GraphQLUpload } = require("graphql-upload");
const { uploadImageToS3 } = require("../../utils/upload");

const { createTransaction } = require("../../utils/transaction");

/** Query Functions */
const category = async (parent, input, context) => {
  try {
    const { id } = input;
    // Fetch a category by ID
    const foundCategory = await CategoryModel.findOne({
      where: { id },
    });

    // Check if the category is not found
    if (!foundCategory) {
      throw new Error(`category with ID ${id} not found`);
    }
    return {
      success: true,
      category: foundCategory,
    };
  } catch (error) {
    console.log("*** ERROR FETCHING CATEGORY ***", error);
    return {
      error,
      success: false,
    };
  }
};

const categories = async (parent, { input }, context) => {
  // Fetch all categories
  const { limit, offset = 0, search } = input || {};
  try {
    const where = {};
    if (search) {
      where.name = { [Op.substring]: search };
    }

    const edges = await CategoryModel.findAll({
      context,
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    const count = await CategoryModel.count({ context, where });

    return {
      count,
      edges,
    };
  } catch (error) {
    console.log("*** ERROR FETCH CATEGORIES ***", error);
    return {
      error,
    };
  }
};

/** Mutation Functions */
const createCategory = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { name, image } = input;
    // Check if the name is unique before creating a new name
    const existingCategory = await CategoryModel.findOne({
      where: { name },
    });
    if (existingCategory) {
      throw new Error("Category name already in use");
    }

    const payload = { name };
    if (image && image !== undefined) {
      const _file = await image;
      const url = await uploadImageToS3(_file);
      const newImage = await ImageModel.create({ url }, { transaction });
      payload.imageId = await newImage.id;
    }
    const newCategory = await CategoryModel.create(payload, { transaction });
    await transaction.commit();
    return {
      success: true,
      category: CategoryModel.findOne({
        where: { id: newCategory.id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const updateCategory = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { id, image, ...updateFields } = input; // Replace with the actual user ID you want to update
    const category = await CategoryModel.findByPk(id);
    if (!category) {
      throw new Error("Category not found.");
    }
    const theCategory = await category.toJSON();
    if (image && image !== undefined) {
      const _file = await image;
      const url = await uploadImageToS3(_file);
      if (theCategory.imageId) {
        await ImageModel.update(
          { url },
          {
            where: { id: theCategory.imageId },
            transaction,
          }
        );
      } else {
        const newImage = await ImageModel.create({ url }, { transaction });
        updateFields.imageId = await newImage.id;
      }
    }

    // Perform the partial update
    await CategoryModel.update(updateFields, {
      where: { id },
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      category: await CategoryModel.findOne({
        where: { id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return { success: false, error };
  }
};

const deleteCategory = async (parent, { input }, context) => {
  try {
    const { id } = input;
    // Fetch a category by ID
    const foundCategory = await CategoryModel.findByPk(id);

    // Check if the category is not found
    if (!foundCategory) {
      throw new Error(`category with ID ${id} not found`);
    }
    await foundCategory.destroy();
    return { success: true, category: foundCategory };
  } catch (error) {
    console.log("*** ERROR DELETING CATEGORY ***", error);
    return {
      success: false,
      error,
    };
  }
};

module.exports = {
  Upload: GraphQLUpload,
  Mutation: {
    createCategory,
    updateCategory,
    deleteCategory,
  },
  Query: {
    category,
    categories,
  },
};
