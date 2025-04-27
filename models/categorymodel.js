const mongoose = require("mongoose");

//1-create schema

const categoryschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "must be required"],
      unique: [true, "must be unique"],
      minlength: [3, "too short category name"],
      maxlength: [32, "too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true }
);

//2-create model

const categorymodel = mongoose.model("category", categoryschema);

module.exports = categorymodel;
