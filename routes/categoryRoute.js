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

const router = express.Router();

router.use("/:categoryID/subcategories", subCategoriesRoute);
router.use("/:categoryID/products", productRoute);

router
  .route("/")
  .get(getcategories)
  .post(
    authService.protect,
    authService.allowedTo("admin", "seller"),
    createCategoryValidator,
    createcategory
  );
router
  .route("/:id")
  .get(getCategoryValidator, getcategory)
  .put(
    authService.protect,
    authService.allowedTo("admin", "seller"),
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
