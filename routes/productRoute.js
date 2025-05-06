const express = require("express");
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");
const {
  getProduct,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createFilterObj,
} = require("../services/productService");
const authService = require("../services/authService");
const reviewRoute = require("./reviewRoute");
const { uploadMedia } = require("../config/multer");

const router = express.Router({ mergeParams: true });

// POST   /products/jkshjhsdjh2332n/reviews
// GET    /products/jkshjhsdjh2332n/reviews
// GET    /products/jkshjhsdjh2332n/reviews/87487sfww3
router.use("/:productId/reviews", reviewRoute);

router
  .route("/")
  .get(createFilterObj, getProducts)
  .post(
    authService.protect,
    authService.allowedTo("admin", "seller"),
    uploadMedia,
    createProductValidator,
    createProduct
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo("admin", "seller"),
    uploadMedia,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
