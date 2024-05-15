// ./graphql/resolvers/user.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  AddressModel,
  EmailModel,
  RoleModel,
  UserModel,
  UserAddressModel,
  ImageModel,
  SmsModel,
} = require("../../models");
const { envConfig } = require("../../config/env.config");
const { createTransaction } = require("../../utils/transaction");
const { createAndFilters } = require("../../utils");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { uploadImageToS3 } = require("../../utils/upload");
const { codeGenerator } = require("../../utils/generateCode");
const { emailMode } = require("../../constant/emailtype");

/** QUERY FUNCTION */
const user = async (parent, input, context) => {
  try {
    const { id } = input;
    const { user } = context;
    const foundUser = await UserModel.findOne(
      {
        include: [
          {
            model: RoleModel,
            as: "role",
          },
          {
            model: AddressModel,
            as: "companyAddress",
          },
          { model: ImageModel, as: "profile" },
        ],
        where: { id: id || user.id },
      },
      { context }
    );
    return foundUser;
  } catch (e) {
    return null;
  }
};

const users = async (parent, { input }, context) => {
  // Fetch all users
  const { limit = 20, offset = 0, roleId, search } = input || {};
  try {
    const include = [
      { model: AddressModel, as: "companyAddress" },
      { model: RoleModel, as: "role" },
      { model: ImageModel, as: "profile" },
    ];
    const filters = [
      { field: "email", operator: Op.like },
      { field: "isActive", operator: Op.eq },
      { field: "lastActive", alias: "from", operator: Op.gte },
      { field: "lastActive", alias: "to", operator: Op.lte },
    ];

    let where = createAndFilters({ filters, values: { ...input } });

    if (search) {
      where[Op.and].push({
        [Op.or]: [
          { email: { [Op.substring]: search } },
          { firstName: { [Op.substring]: search } },
          { lastName: { [Op.substring]: search } },
        ],
      });
    }

    if (roleId) {
      include.push({
        model: RoleModel,
        where: { id: roleId },
        as: "role",
      });
    }

    const edges = await UserModel.findAll({
      context,
      include,
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    const count = await UserModel.count({ context, where });
    const activeUsers = await UserModel.count({
      context,
      where: {
        ...where,
        isActive: true,
      },
    });
    return {
      count,
      edges,
      activeUsers,
      inactiveUsers: count - activeUsers,
    };
  } catch (e) {
    console.log("error", e.message);
    return {
      error: e,
    };
  }
};

const verifyResetToken = async (parent, input, context) => {
  try {
    const { resetToken } = input;
    // Fetch a user by ID
    const foundUser = await UserModel.findOne({ where: { resetToken } });

    // Check if the user is not found
    if (!foundUser) {
      return {
        success: false,
        message: "Invalid reset password token",
      };
    }

    return {
      success: true,
      message: "",
    };
  } catch (error) {
    console.log("*** ERROR FETCH USER ***", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**  MUTATION FUNCTION */
const createUser = async (_, { input }) => {
  const transaction = await createTransaction();
  try {
    const {
      address,
      companyAddress,
      email,
      password,
      firstName,
      lastName,
      middleName,
      gender,
      dateOfBirth,
      contactNumber,
      profileUrl,
      username,
      acceptTermsAndCondition,
    } = input;
    if (!acceptTermsAndCondition) {
      throw new Error("Please read and check terms and conditions.");
    }
    // Check if the email is unique before creating a new user
    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("Email is already in use");
    }
    if (username?.lenght < 3) {
      throw new Error("Username should be alteast 3 character");
    }
    const checkUsername = await UserModel.findOne({ where: { username } });
    if (checkUsername) {
      throw new Error("Username is already in use");
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hashSync(password, 10);

    // Create a new user with hashed password
    const newUser = await UserModel.create(
      {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        middleName,
        gender,
        dateOfBirth,
        contactNumber,
        username,
        updatedAt: new Date().toISOString(),
        lastLogin: null, // Assuming the user has not logged in yet
        username,
        profileUrl,
      },
      { transaction }
    );
    let verificationToken = await codeGenerator.generateUniqueCode(6);
    let findByVerificationToken = await UserModel.findOne({
      where: { verificationToken },
    });

    // Check if the order code already exists
    while (findByVerificationToken) {
      // If an order with this code already exists, generate a new unique code
      verificationToken = await codeGenerator.generateUniqueCode(6);

      // Check again if the newly generated code already exists
      findByVerificationToken = await UserModel.findOne({
        where: { verificationToken },
      });
    }
    // current date time
    const currentDate = new Date();
    // Add 5 minute to the current time
    currentDate.setMinutes(currentDate.getMinutes() + 5);
    await newUser.update(
      { verificationToken, tokenExpireAt: currentDate },
      { transaction }
    );

    await EmailModel.create(
      {
        to: newUser.email,
        subject: "Email Verification",
        body: verificationToken,
        template: emailMode.VERIFY_EMAIL,
        createdBy: newUser.id,
      },
      { transaction }
    );
    if (address) {
      const newAddress = await AddressModel.create(address, { transaction });
      await UserAddressModel.create(
        { userId: newUser.id, addressId: newAddress.id },
        { transaction }
      );
    }
    if (companyAddress) {
      const newAddress = await AddressModel.create(companyAddress, {
        transaction,
      });
      await newUser.update(
        { companyAddressId: newAddress.id },
        { transaction }
      );
    }
    const buyersRole = await RoleModel.findOne({
      where: {
        name: "BUYER",
      },
      transaction,
    });
    if (buyersRole) {
      await newUser.update({ roleId: buyersRole.id }, { transaction });
    }
    await transaction.commit();
    return await UserModel.findOne({
      include: [
        { model: RoleModel, as: "role" },
        {
          model: AddressModel,
          as: "companyAddress",
        },
      ],
      where: {
        id: newUser.id,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.log("*** ERROR CREATING NEW USER ***", error.message);
    throw new Error(error.message);
  }
};

const verifyEmail = async (parent, { input }, context) => {
  try {
    const { token } = input;
    const currentDateTime = new Date();
    // Check if the email is unique before creating a new user
    const userToVerify = await UserModel.findOne({
      where: {
        verificationToken: token,
      },
    });
    if (!userToVerify) {
      throw new Error("Invalid token!");
    }

    const checkExpired = await UserModel.findOne({
      where: {
        verificationToken: token,
        tokenExpireAt: { [Op.lte]: currentDateTime },
      },
    });
    if (checkExpired) {
      throw new Error("Token expired!");
    }
    await userToVerify.update({
      isVerified: 1,
      verificationToken: null,
      updatedAt: Date.now,
      tokenExpireAt: null,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

const verifyContactNumber = async (parent, { input }, context) => {
  try {
    const { otp, countryCode, contactNumber } = input;
    const { user } = context;
    const currentDateTime = new Date();
    // Check if the email is unique before creating a new user
    const userToVerify = await UserModel.findOne({
      where: {
        otp,
        id: user.id,
      },
    });
    if (!userToVerify) {
      throw new Error("Invalid OTP!");
    }

    const checkExpired = await UserModel.findOne({
      where: {
        otp,
        tokenExpireAt: { [Op.lte]: currentDateTime },
        id: user.id,
      },
    });
    if (checkExpired) {
      throw new Error("OTP expired!");
    }
    await userToVerify.update({
      isContactNumberVerified: 1,
      otp: null,
      countryCode,
      contactNumber,
      updatedAt: Date.now,
      tokenExpireAt: null,
    });
    return {
      success: true,
      user: await UserModel.findOne({
        where: {
          id: user.id,
        },
      }),
    };
  } catch (error) {
    return { success: false, error };
  }
};

const login = async (parent, { input }, context) => {
  try {
    // Find the user by email
    const { username, password } = input;

    const user = await UserModel.findOne({
      where: { [Op.or]: [{ email: username }, { username: username }] },
    });

    // Check if the user exists
    if (!user) {
      throw new Error("User not found");
    }
    const theUser = user.toJSON();

    // Verify the password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    if (!theUser.isVerified) {
      let verificationToken = await codeGenerator.generateUniqueCode(6);
      let findByVerificationToken = await UserModel.findOne({
        where: { verificationToken },
      });

      // Check if the order code already exists
      while (findByVerificationToken) {
        // If an order with this code already exists, generate a new unique code
        verificationToken = await codeGenerator.generateUniqueCode(6);

        // Check again if the newly generated code already exists
        findByVerificationToken = await UserModel.findOne({
          where: { verificationToken },
        });
      }
      // current date time
      const currentDate = new Date();
      // Add 5 minute to the current time
      currentDate.setMinutes(currentDate.getMinutes() + 5);
      await user.update({ verificationToken, tokenExpireAt: currentDate });
      await EmailModel.create({
        to: theUser.email,
        subject: "Verify email",
        body: verificationToken,
        template: emailMode.VERIFY_EMAIL,
        createdBy: theUser.id,
      });
      return {
        success: false,
        user: UserModel.findOne({
          include: [{ model: RoleModel, as: "role" }],
          where: { id: user.id },
        }),
      };
    }

    const jwt_secret = envConfig.JWT_SECRET_KEY;
    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, jwt_secret, {
      expiresIn: "8h",
    });

    // Update lastLogin and save user
    const lastActive = new Date();
    const isActive = true;
    await user.update(
      { lastActive, isActive },
      { where: { [Op.or]: [{ email: username }, { username: username }] } }
    );

    // Return the token
    return {
      success: true,
      token,
      user: UserModel.findOne({
        include: [{ model: RoleModel, as: "role" }],
        where: { id: user.id },
      }),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateUser = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { user } = context;
    const { companyAddress, image, ...updateFields } = input;
    if (user?.companyAddressId) {
      if (companyAddress) {
        await AddressModel.update(companyAddress, {
          where: {
            id: user.companyAddressId,
          },
          transaction,
        });
      }
    } else {
      const newAddress = await AddressModel.create(companyAddress, {
        transaction,
      });
      await UserModel.update(
        { companyAddressId: newAddress.id },
        {
          where: { id: user.id },
          transaction,
        }
      );
    }
    if (image && image !== undefined) {
      const _file = await image;
      const url = await uploadImageToS3(_file);
      if (user.imageId) {
        await ImageModel.update(
          { url },
          {
            where: { id: user.imageId },
            transaction,
          }
        );
      } else {
        const newImage = await ImageModel.create({ url }, { transaction });
        updateFields.imageId = await newImage.id;
      }
    }

    await UserModel.update(updateFields, {
      where: { id: user.id },
      transaction,
    });
    await transaction.commit();
    return {
      success: true,
      message: "User updated successfully.",
      user: await UserModel.findOne({
        include: [
          { model: RoleModel, as: "role" },
          {
            model: AddressModel,
            as: "companyAddress",
          },
          { model: ImageModel, as: "profile" },
        ],
        where: { id: user.id },
      }),
    };
  } catch (error) {
    await transaction.rollback();
    return {
      success: false,
      error,
    };
  }
};

const forgetPassword = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { email } = input;
    const user = await UserModel.findOne({
      include: [{ model: RoleModel, as: "role" }],
      where: { email },
    });
    if (user) {
      const resetToken = uuidv4();
      // current date time
      const currentDate = new Date();
      // Add 5 minute to the current time
      currentDate.setMinutes(currentDate.getMinutes() + 5);
      await user.update(
        { resetToken, tokenExpireAt: currentDate },
        { transaction }
      );
      const user_ = user.toJSON();
      await EmailModel.create(
        {
          to: user_.email,
          subject: "Reset password request",
          body: `${
            user_?.role?.name == "ADMIN"
              ? envConfig.ADMINS_BASE_URL_BASE_URL
              : envConfig.BUYERS_BASE_URL
          }sign-in/?token=${resetToken}`,
          template: emailMode.RESET_PASSWORD,
          createdBy: user_.id,
        },
        { transaction }
      );
      await transaction.commit();
      return {
        success: true,
        message: "Please check your email for reset token",
      };
    }
    throw new Error(`User not found`);
  } catch (error) {
    await transaction.rollback();
    return {
      success: false,
      message: error.message,
    };
  }
};

const resetPassword = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { resetToken, newPassword, confirmNewPassword } = input;
    if (newPassword !== confirmNewPassword) {
      throw new Error(`Password not match`);
    }

    if (!resetToken) {
      throw new Error(`Reset token is required.`);
    }
    const checkTokenExist = await UserModel.findOne({
      where: {
        resetToken,
      },
    });
    if (!checkTokenExist) {
      throw new Error(`Invalid token.`);
    }
    const currentDateTime = new Date();
    const user = await UserModel.findOne({
      where: { resetToken, tokenExpireAt: { [Op.gte]: currentDateTime } },
    });

    if (user) {
      // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hashSync(newPassword, 10);
      await user.update(
        { password: hashedPassword, resetToken: null, tokenExpireAt: null },
        { transaction }
      );
      const user_ = user.toJSON();
      await EmailModel.create(
        {
          to: user_.email,
          subject: "Password changed.",
          body: `Your password changed sucessfully.`,
          createdBy: user_.id,
          template: emailMode.PASSWORD_CHANGED,
        },
        { transaction }
      );
      await transaction.commit();
      return {
        success: true,
        message: "Your password changed sucessfully.",
      };
    }
    throw new Error(`Token Expired.`);
  } catch (error) {
    await transaction.rollback();
    return {
      success: false,
      message: "Failed to reset password",
      error,
    };
  }
};

const changePassword = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { user } = context;
    const { password, newPassword, confirmNewPassword } = input;
    if (newPassword != confirmNewPassword) {
      throw new Error(`Password not match`);
    }
    if (password === newPassword) {
      throw new Error(`Password matched with previous pasword.`);
    }
    // Verify the password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Previous password not matched.");
    }
    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hashSync(newPassword, 10);
    if (user) {
      await UserModel.update(
        { password: hashedPassword, resetToken: null },
        {
          where: {
            id: user.id,
          },
          transaction,
        }
      );
      await EmailModel.create(
        {
          to: user.email,
          subject: "Password changed.",
          body: `Your password changed sucessfully.`,
          createdBy: user.createdBy,
          template: emailMode.PASSWORD_CHANGED,
        },
        { transaction }
      );
      await transaction.commit();
      return {
        success: true,
        message: "Your password changed sucessfully.",
      };
    }
    throw new Error(`User not found`);
  } catch (error) {
    await transaction.rollback();
    return {
      success: false,
      message: error.message,
      error,
    };
  }
};

const deleteUser = async (parent, { input }, context) => {
  try {
    const { id } = input;
    // Fetch a brand by ID
    const foundUser = await UserModel.findById(id);

    // Check if the brand is not found
    if (!foundUser) {
      throw new Error(`user not found`);
    }
    await UserModel.findByIdAndDelete(id);
    return { success: true, message: "User delete sucessfully" };
  } catch (error) {
    console.log("*** ERROR FETCH BRAND ***", error);
    return { success: true, message: error.message };
  }
};

const requestVerifyEmail = async (parent, { input }, context) => {
  const transaction = await createTransaction();
  try {
    const { email } = input;
    const user = await UserModel.findOne({
      include: [{ model: RoleModel, as: "role" }],
      where: { email },
    });
    if (user) {
      let verificationToken = await codeGenerator.generateUniqueCode(6);
      let findByVerificationToken = await UserModel.findOne({
        where: { verificationToken },
      });

      // Check if the order code already exists
      while (findByVerificationToken) {
        // If an order with this code already exists, generate a new unique code
        verificationToken = await codeGenerator.generateUniqueCode(6);

        // Check again if the newly generated code already exists
        findByVerificationToken = await UserModel.findOne({
          where: { verificationToken },
        });
      }
      // current date time
      const currentDate = new Date();
      // Add 5 minute to the current time
      currentDate.setMinutes(currentDate.getMinutes() + 5);
      await user.update(
        { verificationToken, tokenExpireAt: currentDate },
        { transaction }
      );
      const user_ = user.toJSON();

      if (user_.isVerified) {
        throw new Error(`Email already verified`);
      }
      await EmailModel.create(
        {
          to: user_.email,
          subject: "Verify email",
          body: verificationToken,
          template: emailMode.VERIFY_EMAIL,
          createdBy: user_.id,
        },
        { transaction }
      );
      await transaction.commit();
      return {
        success: true,
        message: "Please check your email.",
      };
    }
    throw new Error(`User not found`);
  } catch (error) {
    await transaction.rollback();
    return {
      success: false,
      error,
    };
  }
};

module.exports = {
  Mutation: {
    changePassword,
    createUser,
    deleteUser,
    forgetPassword,
    login,
    requestVerifyEmail,
    resetPassword,
    updateUser,
    verifyContactNumber,
    verifyEmail,
  },
  Query: {
    user,
    users,
    verifyResetToken,
  },
};
