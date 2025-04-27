const brandModel = require("../models/brandModel");
const factory = require("./handlerFactory");

// @desc  get list of brands
// @route GET /api/v1/brands
//@access  puplic
exports.getBrands = factory.getAll(brandModel);

// @desc  get specific brand by id
// @route GET /api/v1/brands/:id
// @access puplic
exports.getBrand = factory.getOne(brandModel);

// @desc  create brand
// @route POST /api/v1/brands
// @access  private
exports.createBrand = factory.create(brandModel);

// @desc update specific brand
// @route PUT /api/v1/brands/:id
// @access private
exports.updateBrand = factory.update(brandModel);

// @desc delete specific brand
// @route DELETE /api/v1/brands/:id
// @access private

exports.deleteBrand = factory.delete(brandModel);
