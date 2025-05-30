const asynchandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const VerificationCode = require("../models/verificationCodeModel");

// @desc  verificationCode
// @route GET /api/v1/auth/request-verification
// @access  puplic
exports.verificationCode = asynchandler(async function (req, res, next) {
  const { email } = req.body;

  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiry time (e.g. 10 minutes)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Delete old code if exists
  await VerificationCode.deleteMany({ email });

  // Save to DB
  await VerificationCode.create({ email, code, expiresAt });

  // Send the code via email
  await sendEmail(email, `Your verification code is: ${code}`);

  res.status(200).json({ message: "Verification code sent" });
});

// @desc  signup
// @route GET /api/v1/auth/signup
//@access  puplic
exports.signup = asynchandler(async function (req, res, next) {
  const { name, email, password, role, code } = req.body;

  // Check code in DB
  const record = await VerificationCode.findOne({ email, code });

  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  // Optional: Check if user exists
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await userModel.create({
    name,
    email,
    password,
    role,
  });

  // Generate token
  const token = createToken(user._id);

  // Clean up code
  await VerificationCode.deleteMany({ email });

  res.status(201).json({ message: "User created", data: user, token });
});

exports.login = asynchandler(async function (req, res, next) {
  const user = await userModel.findOne({ email: req.body.email });

  console.log(user);
  console.log(!(await bcrypt.compare(req.body.password, user.password)));

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect password or email", 401));
  }

  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

exports.protect = asynchandler(async function (req, res, next) {
  // 1) check if token exist
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError("you are not login please login to access this route", 401)
    );
  }

  //2) verify token (no changes happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);

  // 3) Check if user exists
  const currentUser = await userModel.findById(decoded.userId);
  console.log(currentUser);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }

  // 4)check if user change his password after token created
  if (currentUser.passwordchangeAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordchangeAt.getTime() / 1000,
      10
    );
    //password changed after created token [error]
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password. please login again..",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

//@desc   user permissions
//...roles => ["admin","seller"]
exports.allowedTo = (...roles) =>
  asynchandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you are not allowed to access this route", 403)
      );
    }
    next();
  });

exports.forgotPassword = asynchandler(async (req, res, next) => {
  // 1) get user by email
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("there is no user with that email", 404));
  }
  // 2)If user exist, generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();
  // 3) send the reset code via email
  const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;
  await sendEmail({
    email: user.email,
    subject: "Your password reset code (valid for 10 min)",
    message,
  });

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});
