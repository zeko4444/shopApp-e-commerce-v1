const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");
const brandmodel = require("../models/brandModel");
const ApiError = require("../utils/apiError");

// @desc    Add brand to follow
// @route   POST /api/v1/follow
// @access  Protected/User
exports.addBrandToFollow = asyncHandler(async (req, res, next) => {
  const brand = await brandmodel.findById(req.body.brandId);

  if (!brand)
    return next(new ApiError(`No brand for this id ${req.body.brandId}`, 404));

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { follow: req.body.brandId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Brand added successfully to your Follow.",
    data: user.follow,
  });
});

// @desc    Remove brand from follow
// @route   DELETE /api/v1/follow/:brandId
// @access  Protected/User
exports.removeBrandFromFollow = asyncHandler(async (req, res, next) => {
  const brand = await brandmodel.findById(req.params.brandId);

  if (!brand)
    return next(
      new ApiError(`No brand for this id ${req.params.brandId}`, 404)
    );

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { follow: req.params.brandId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Brand removed successfully from your follow.",
    data: user.follow,
  });
});

// @desc    Get logged user follow
// @route   GET /api/v1/follow
// @access  Protected/User
exports.getLoggedUserFollow = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("follow");

  res.status(200).json({
    status: "success",
    results: user.follow.length,
    data: user.follow,
  });
});
