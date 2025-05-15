const asynchandler = require("express-async-handler");
const productModel = require("../models/productModel");
const factory = require("./handlerFactory");

exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryID) {
    filterObject = { category: req.params.categoryID };
  } else if (req.params.brandID) {
    filterObject = { brand: req.params.brandID };
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

exports.getRelatedProducts = asynchandler(async (req, res, next) => {
  const productId = req.params.id;

  // 1. Find the product by ID
  const product = await productModel.findById(productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // 2. Find products with the same brand and category, excluding the current product
  const relatedProducts = await productModel.find({
    _id: { $ne: productId }, // Exclude the current product
    brand: product.brand, // Same brand
    category: product.category, // Same category
  });

  // 3. Respond with related products
  res
    .status(200)
    .json({ message: "Related products found", data: relatedProducts });
});

exports.getOtherBrandsInCategory = asynchandler(async (req, res, next) => {
  const productId = req.params.id;

  // 1. Find the current product
  const currentProduct = await productModel.findById(productId);
  if (!currentProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  const categoryId = currentProduct.category;
  const currentBrandId = currentProduct.brand?.toString();

  // 2. Find products in same category but from other brands
  const otherBrandProducts = await productModel
    .find({
      category: categoryId,
      brand: { $ne: currentBrandId }, // Exclude current brand
    })
    .populate("brand");

  // 3. Group products by brand
  const brandMap = {};

  otherBrandProducts.forEach((product) => {
    if (product.brand) {
      const brandId = product.brand._id.toString();
      if (!brandMap[brandId]) {
        brandMap[brandId] = {
          brand: {
            _id: product.brand._id,
            name: product.brand.name,
            slug: product.brand.slug,
          },
          products: [],
        };
      }
      brandMap[brandId].products.push(product);
    }
  });

  const result = Object.values(brandMap);

  res.status(200).json({
    message: "Other brands with products in same category",
    data: result,
  });
});
