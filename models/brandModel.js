const mongoose = require("mongoose");

//1-create schema

const brandschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "must be required"],
      unique: [true, "must be unique"],
      minlength: [3, "too short brand name"],
      maxlength: [32, "too long brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    brandImage: String,
    cover: {
      url: String, // URL for the cover image/video
      type: { type: String, enum: ["image", "video"] }, // type for cover (either 'image' or 'video')
    },
  },
  { timestamps: true }
);

//2-create model

const brandmodel = mongoose.model("brand", brandschema);

module.exports = brandmodel;
