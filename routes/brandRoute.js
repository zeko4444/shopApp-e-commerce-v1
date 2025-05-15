const express = require("express");
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validators/brandValidator");
const {
  getBrand,
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
  getBrandsWithProducts,
} = require("../services/brandservice");

const productRoute = require("./productRoute");

const authService = require("../services/authService");
const { uploadMedia } = require("../config/multer");

const router = express.Router();

router.use("/:brandID/products", productRoute);

router
  .route("/")
  .get(getBrands)
  .post(
    authService.protect,
    authService.allowedTo("admin", "seller"),
    uploadMedia,
    createBrandValidator,
    createBrand
  );

router.get("/brands-with-products", getBrandsWithProducts);

router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    authService.protect,
    authService.allowedTo("admin", "seller"),
    uploadMedia,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;
