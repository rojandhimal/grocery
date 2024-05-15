const { AuthenticationError } = require("apollo-server-express");
const { envConfig } = require("../config/env.config");
const models = require("../models");
const jwt = require("jsonwebtoken");
const { userRole } = require("../constant/user");

module.exports = async ({ req }) => {
  const token = (req.headers.authorization || "").split(" ")[1];
  // List of operations that should bypass authentication
  const publicOperations = [
    "Login",
    "VerifyEmail",
    "CreateUser",
    "ForgetPassword",
    "ResetPassword",
    "RequestVerifyEmail",
    "VehicleFilters",
    "AllBrands",
    "Testimonial",
    "Testimonials",
    "PrivacyPolicy",
    "TermsAndCondition",
  ];
  // if the operation is not in the nonAuthOperations array
  const operationName = req?.body?.operationName;
  if (!publicOperations.includes(operationName)) {
    // if the user is not authenticated
    const decoded = jwt.verify(token, envConfig.JWT_SECRET_KEY);
    if (!decoded?.id) throw new AuthenticationError("InvalidToken");

    const user = await models.UserModel.findOne({
      include: [{ model: models.RoleModel, as: "role" }],
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AuthenticationError("User not found");
    }
    const theUser = user.toJSON();

    if (theUser.role.name == userRole.BUYER && !theUser.isVerified) {
      throw new AuthenticationError("Please verify your email.");
    }
    return {
      operationName,
      user: theUser,
      models,
    };
  }

  return { operationName, headers: req.headers };
};
