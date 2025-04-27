const productModel = require("../models/productModel");
const factory = require("./handlerFactory");

exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryID) {
    filterObject = { category: req.params.categoryID };
  }

  req.filterObj = filterObject;
  next();
};
// @desc  get list of products
// @route GET /api/v1/products
//@access  puplic
exports.getProducts = factory.getAll(productModel);

// @desc  get specific product by id
// @route GET /api/v1/products/:id
// @access puplic
exports.getProduct = factory.getOne(productModel, "reviews");

// @desc  create product
// @route POST /api/v1/products
// @access  private
exports.createProduct = factory.create(productModel);

// @desc update specific product
// @route PUT /api/v1/products/:id
// @access private
exports.updateProduct = factory.update(productModel);

// @desc delete specific product
// @route DELETE /api/v1/products/:id
// @access private
exports.deleteProduct = factory.delete(productModel);
