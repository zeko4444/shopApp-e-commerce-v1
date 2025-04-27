const userModel = require("../models/userModel");
const factory = require("./handlerFactory");
const asynchandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const bcrypt = require("bcryptjs");
const createToken = require("../utils/createToken");

// @desc  get list of users
// @route GET /api/v1/users
//@access  private
exports.getUsers = factory.getAll(userModel);

// @desc  get specific user by id
// @route GET /api/v1/users/:id
// @access private
exports.getUser = factory.getOne(userModel);

// @desc  create user
// @route POST /api/v1/users
// @access  private
exports.createUser = factory.create(userModel);

// @desc update specific user
// @route PUT /api/v1/users/:id
// @access private
exports.updateUser = asynchandler(async (req, res, next) => {
  const document = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`no document for this id ${id}`, 404));
  }
  res.status(201).json({ data: document });
});

exports.changeUserPassword = asynchandler(async (req, res, next) => {
  const document = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordchangeAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`no document for this id ${id}`, 404));
  }
  res.status(201).json({ data: document });
});

// @desc delete specific user
// @route DELETE /api/v1/users/:id
// @access private

exports.deleteUser = factory.delete(userModel);

// @desc  get logged user data
// @route GET /api/v1/users/getMe
// @access private
exports.getLoggedUserData = asynchandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/changeMyPassword
// @access  Private
exports.updateLoggedUserPassword = asynchandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordchangeAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new ApiError(`no user for this id ${id}`, 404));
  }
  const token = createToken(user._id);
  res.status(201).json({ data: user, token });
});

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asynchandler(async (req, res, next) => {
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});
