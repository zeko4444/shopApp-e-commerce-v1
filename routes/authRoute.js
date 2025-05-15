const express = require("express");
const {
  signupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");
const {
  signup,
  login,
  forgotPassword,
  verificationCode,
} = require("../services/authService");
const VerificationCode = require("../models/verificationCodeModel");

const router = express.Router();

router.post("/request-verification", verificationCode);
router.route("/signup").post(signupValidator, signup);
router.route("/login").post(loginValidator, login);
router.route("/forgotPassword").post(forgotPassword);
// router
//   .route("/:id")
//   .get(getUserValidator, getUser)
//   .put(updateUserValidator, updateUser)
//   .delete(deleteUserValidator, deleteUser);

module.exports = router;
