const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      max: 200000,
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],
    imgCover: {
      type: String,
      required: true,
    },
    imgs: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: true,
    },
    subCategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subcategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "brand",
    },
    ratingAvg: {
      type: Number,
      min: 1,
      max: 5,
    },
    ratingNum: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;
