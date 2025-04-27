const categorymodel = require("../models/categorymodel");
const factory = require("./handlerFactory");

// @desc  get list of categories
// @route GET /api/v1/categories
//@access  puplic
exports.getcategories = factory.getAll(categorymodel);

// @desc  get specific category by id
// @route GET /api/v1/categories/:id
// @access puplic
exports.getcategory = factory.getOne(categorymodel);

// @desc  create category
// @route POST /api/v1/categories
// @access  private
exports.createcategory = factory.create(categorymodel);

// @desc update specific category
// @route PUT /api/v1/categories/:id
// @access private
exports.updatecategory = factory.update(categorymodel);

// @desc delete specific category
// @route DELETE /api/v1/categories/:id
// @access private

exports.deletecategory = factory.delete(categorymodel);
