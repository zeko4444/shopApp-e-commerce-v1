const asynchandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.delete = (model) =>
  asynchandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await model.findById(id);
    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    await document.deleteOne(); // Works with Mongoose 7+

    res.status(204).send();
  });

exports.update = (model) =>
  asynchandler(async (req, res, next) => {
    const uploadedFiles = req.files;

    const existingDoc = await model.findById(req.params.id);
    if (!existingDoc) {
      // Cleanup uploaded files before exiting
      Object.values(uploadedFiles || {})
        .flat()
        .forEach((file) => fs.unlinkSync(file.path));
      return next(
        new ApiError(`No document found with ID ${req.params.id}`, 404)
      );
    }

    // 1. Prepare update payload (ignore cloudinary for now)
    if (uploadedFiles?.image) {
      req.body.image = uploadedFiles.image[0].path;
    }
    if (uploadedFiles?.brandImage) {
      req.body.brandImage = uploadedFiles.brandImage[0].path;
    }
    if (uploadedFiles?.cover) {
      req.body.cover = uploadedFiles.cover[0].path;
    }
    if (uploadedFiles?.imgs) {
      req.body.imgs = uploadedFiles.imgs.map((f) => f.path);
    }

    // 2. Update DB (without cloudinary)
    const updatedDoc = await model.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    if (!updatedDoc) {
      // Cleanup uploaded files
      Object.values(uploadedFiles || {})
        .flat()
        .forEach((file) => fs.unlinkSync(file.path));
      return next(new ApiError("Failed to update the document", 500));
    }

    // 3. Now that DB is updated, upload to cloudinary
    const getPublicId = (url) => {
      const parts = url.split("/");
      const fileName = parts[parts.length - 1];
      return `uploads/${fileName.split(".")[0]}`;
    };

    const urls = {};

    if (uploadedFiles?.image) {
      if (existingDoc.image) {
        await cloudinary.uploader.destroy(getPublicId(existingDoc.image));
      }
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: "uploads",
      });
      fs.unlinkSync(req.body.image);
      urls.image = result.secure_url;
    }

    if (uploadedFiles?.brandImage) {
      if (existingDoc.brandImage) {
        await cloudinary.uploader.destroy(getPublicId(existingDoc.brandImage));
      }
      const result = await cloudinary.uploader.upload(req.body.brandImage, {
        folder: "uploads",
      });
      fs.unlinkSync(req.body.brandImage);
      urls.brandImage = result.secure_url;
    }

    if (uploadedFiles?.cover) {
      if (existingDoc.cover?.url) {
        await cloudinary.uploader.destroy(getPublicId(existingDoc.cover.url), {
          resource_type: existingDoc.cover.type || "image",
        });
      }
      const result = await cloudinary.uploader.upload(req.body.cover, {
        folder: "uploads",
        resource_type: "auto",
      });
      fs.unlinkSync(req.body.cover);
      urls.cover = { url: result.secure_url, type: result.resource_type };
    }

    if (uploadedFiles?.imgs) {
      if (Array.isArray(existingDoc.imgs)) {
        for (const img of existingDoc.imgs) {
          await cloudinary.uploader.destroy(getPublicId(img.url), {
            resource_type: img.type || "image",
          });
        }
      }

      const imgUrls = [];
      for (let i = 0; i < req.body.imgs.length; i++) {
        const filePath = req.body.imgs[i];
        const resourceType = uploadedFiles.imgs[i].mimetype.startsWith("image")
          ? "image"
          : "video";
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "uploads",
          resource_type: resourceType,
        });
        fs.unlinkSync(filePath);
        imgUrls.push({ url: result.secure_url, type: resourceType });
      }

      urls.imgs = imgUrls;
    }

    // 4. Update doc again to set cloudinary URLs
    const finalDoc = await model.findByIdAndUpdate(
      req.params.id,
      {
        ...(urls.image && { image: urls.image }),
        ...(urls.brandImage && { brandImage: urls.brandImage }),
        ...(urls.cover && { cover: urls.cover }),
        ...(urls.imgs && { imgs: urls.imgs }),
      },
      { new: true }
    );

    res.status(200).json({ data: finalDoc });
  });

exports.create = (model) =>
  asynchandler(async (req, res, next) => {
    const uploadedFiles = req.files;
    const urls = {};
    const cloudinaryUrls = {}; // Store cloudinary URLs to delete if error occurs

    try {
      if (uploadedFiles?.image) {
        const imagePath = uploadedFiles.image[0].path;
        const result = await cloudinary.uploader.upload(imagePath, {
          folder: "uploads",
        });
        fs.unlinkSync(imagePath); // remove local file
        urls.imagePath = result.secure_url;
        cloudinaryUrls.imagePath = result.public_id; // Save the Cloudinary public_id for potential rollback
      }

      if (uploadedFiles?.brandImage) {
        const brandImagePath = uploadedFiles.brandImage[0].path;
        const result = await cloudinary.uploader.upload(brandImagePath, {
          folder: "uploads",
        });
        fs.unlinkSync(brandImagePath); // remove local file
        urls.brandImage = result.secure_url;
        cloudinaryUrls.brandImage = result.public_id; // Save public_id for potential rollback
      }

      if (uploadedFiles?.cover) {
        const coverPath = uploadedFiles.cover[0].path;
        const result = await cloudinary.uploader.upload(coverPath, {
          folder: "uploads",
          resource_type: "auto", // handles both image and video
        });
        fs.unlinkSync(coverPath); // remove local file
        urls.cover = {
          url: result.secure_url,
          type: result.resource_type, // 'image' or 'video'
        };
        cloudinaryUrls.cover = result.public_id; // Save public_id for potential rollback
      }

      if (uploadedFiles?.imgs) {
        const imgUrls = [];
        for (let img of uploadedFiles.imgs) {
          const imgPath = img.path;
          const resourceType = img.mimetype.startsWith("image")
            ? "image"
            : "video"; // Determine if it's image or video
          const result = await cloudinary.uploader.upload(imgPath, {
            folder: "uploads",
            resource_type: resourceType,
          });

          fs.unlinkSync(imgPath); // remove local file
          imgUrls.push({
            url: result.secure_url,
            type: resourceType,
          });
          cloudinaryUrls.imgs = cloudinaryUrls.imgs || [];
          cloudinaryUrls.imgs.push(result.public_id); // Save public_ids for rollback
        }

        urls.imgs = imgUrls;
      }

      // Add uploaded URLs to request body
      req.body.image = urls.imagePath || undefined;
      req.body.brandImage = urls.brandImage || undefined;
      req.body.cover = urls.cover || undefined;
      req.body.imgs = urls.imgs || [];

      // Now, attempt to create the document in the database
      const document = await model.create(req.body);

      res.status(201).json({ data: document });
    } catch (error) {
      // If any error occurs, delete the uploaded files from Cloudinary
      if (cloudinaryUrls.imagePath) {
        await cloudinary.uploader.destroy(cloudinaryUrls.imagePath); // Delete image from Cloudinary
      }
      if (cloudinaryUrls.brandImage) {
        await cloudinary.uploader.destroy(cloudinaryUrls.brandImage); // Delete brand image from Cloudinary
      }
      if (cloudinaryUrls.cover) {
        await cloudinary.uploader.destroy(cloudinaryUrls.cover); // Delete cover image/video from Cloudinary
      }
      if (cloudinaryUrls.imgs) {
        for (let imgId of cloudinaryUrls.imgs) {
          await cloudinary.uploader.destroy(imgId); // Delete image/video from Cloudinary
        }
      }

      // Return the error response to the client
      next(error);
    }
  });

exports.getOne = (Model, populationOpt) =>
  asynchandler(async (req, res, next) => {
    const { id } = req.params;
    // 1) Build query
    let query = Model.findById(id);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    // 2) Execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (model) =>
  asynchandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    console.log(filter);
    const docsNumber = await model.countDocuments();
    const apiFeatures = new ApiFeatures(model.find(filter), req.query)
      .paginate(docsNumber)
      .filter()
      .search()
      .limit()
      .sort();

    const { mongooseQuery, paginationResults } = apiFeatures;
    const documents = await mongooseQuery;
    res
      .status(200)
      .json({ results: documents.length, paginationResults, data: documents });
  });
