const express = require("express");

const authService = require("../services/authService");

const {
  addBrandToFollow,
  removeBrandFromFollow,
  getLoggedUserFollow,
} = require("../services/followService");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));

router.route("/").post(addBrandToFollow).get(getLoggedUserFollow);

router.delete("/:brandId", removeBrandFromFollow);

module.exports = router;
