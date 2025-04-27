const slugify = require("slugify");
const asynchandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const subCategoryModel = require("../models/subCategoryModel");
const factory = require("./handlerFactory");
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryID;
  next();
};

// @desc  create subCategory
// @route POST /api/v1/subCategories
// @access  private
exports.createSubCategory = factory.create(subCategoryModel);

exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryID) {
    filterObject = { category: req.params.categoryID };
  }

  req.filterObj = filterObject;
  next();
};

// @desc  get list of subcategories
// @route GET /api/v1/subcategories
//@access  puplic
exports.getSubCategories = factory.getAll(subCategoryModel);

// @desc  get specific subcategories by id
// @route GET /api/v1/subcategories/:id
// @access puplic
exports.getSubCategory = factory.getOne(subCategoryModel);

// @desc update specific subcategory
// @route PUT /api/v1/subcategories/:id
// @access private
exports.updateSubCategory = factory.update(subCategoryModel);

// @desc delete specific subcategory
// @route DELETE /api/v1/subcategories/:id
// @access private

exports.deleteSubCategory = factory.delete(subCategoryModel);
