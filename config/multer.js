const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const ApiError = require("../utils/apiError");
const path = require("path");

// Configure Multer Storage (Disk Storage)
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // save to 'uploads' folder
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // get file extension
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, fileName); // set the file name
  },
});

// File Filter for image and video
const multerFilter = function (req, file, cb) {
  if (
    (file.fieldname === "brandImage" && file.mimetype.startsWith("image")) ||
    (file.fieldname === "image" && file.mimetype.startsWith("image")) ||
    (file.fieldname === "cover" &&
      (file.mimetype.startsWith("image") ||
        file.mimetype.startsWith("video"))) ||
    (file.fieldname === "imgs" &&
      (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")))
  ) {
    cb(null, true);
  } else {
    cb(new ApiError("Only images or videos are allowed", 400), false);
  }
};

// Multer setup
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max size for each file
});

// Upload handler
exports.uploadMedia = upload.fields([
  { name: "brandImage", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "cover", maxCount: 1 },
  { name: "imgs", maxCount: 5 },
]);
