const express = require("express");
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidator");
const {
  getcategory,
  createcategory,
  getcategories,
  updatecategory,
  deletecategory,
} = require("../services/categoryservice");
const subCategoriesRoute = require("./subCategoryRoute");
const productRoute = require("./productRoute");
const authService = require("../services/authService");
const { uploadMedia } = require("../config/multer");
const router = express.Router();

router.use("/:categoryID/subcategories", subCategoriesRoute);
router.use("/:categoryID/products", productRoute);
const { uploadImage } = require("../config/multer");

router
  .route("/")
  .get(getcategories)
  .post(
    authService.protect,
    authService.allowedTo("admin", "seller"),
    uploadMedia,
    createCategoryValidator,
    createcategory
  );
router
  .route("/:id")
  .get(getCategoryValidator, getcategory)
  .put(
    authService.protect,
    authService.allowedTo("admin", "seller"),
    uploadMedia,
    updateCategoryValidator,
    updatecategory
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteCategoryValidator,
    deletecategory
  );

module.exports = router;
