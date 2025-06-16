const path = require("path");
const { cloudinary } = require("../config/envConfig"); // Import cloudinary instance

// API Endpoint for File Upload
exports.uploadMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const { originalname, buffer, mimetype } = req.file;

  try {
    const resourceType = mimetype.startsWith("video/") ? "video" : "image";
    const publicId = `${resourceType}_${Date.now()}_${path
      .parse(originalname)
      .name.replace(/\s/g, "_")}`;

    const uploadOptions = {
      resource_type: resourceType,
      public_id: publicId,
      folder: `uploads/${resourceType}s`,
    };

    const cloudinaryStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({
            message: "Error uploading file to Cloudinary.",
            error: error.message,
          });
        }

        res.status(200).json({
          message: "File uploaded successfully!",
          publicId: result.public_id,
          url: result.secure_url,
          thumbnailUrl:
            resourceType === "video" ? result.thumbnail_url : result.secure_url,
          format: result.format,
          resourceType: result.resource_type,
          bytes: result.bytes,
        });
      }
    );

    cloudinaryStream.end(buffer);
  } catch (error) {
    console.error("Server error during upload process:", error);
    res.status(500).json({
      message: "Internal server error during file upload.",
      error: error.message,
    });
  }
};

// API Endpoint to Fetch All Images and Videos from Cloudinary
exports.getAllMedia = async (req, res) => {
  try {
    const imageResources = await cloudinary.api.resources({
      type: "upload",
      prefix: "uploads/images/",
      resource_type: "image",
      max_results: 100,
    });

    const videoResources = await cloudinary.api.resources({
      type: "upload",
      prefix: "uploads/videos/",
      resource_type: "video",
      max_results: 100,
    });

    const allMedia = [
      ...(imageResources.resources || []),
      ...(videoResources.resources || []),
    ].map((resource) => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      resourceType: resource.resource_type,
      format: resource.format,
      bytes: resource.bytes,
      createdAt: resource.created_at,
    }));

    res.status(200).json({
      message: "Successfully fetched media from Cloudinary.",
      media: allMedia,
    });
  } catch (error) {
    console.error("Cloudinary fetch error:", error);
    res.status(500).json({
      message: "Error fetching media from Cloudinary.",
      error: error.message,
    });
  }
};

// DELETE API to remove a file from Cloudinary
exports.deleteMedia = async (req, res) => {
  const { publicId, resourceType } = req.body;

  if (!publicId) {
    return res.status(400).json({ message: "Missing publicId in request body." });
  }
  if (!resourceType) {
    return res.status(400).json({ message: "Missing resourceType in request body." });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result === "ok") {
      return res.status(200).json({
        message: "File deleted successfully from Cloudinary.",
        publicId,
      });
    } else {
      return res.status(400).json({
        message: "Failed to delete the file from Cloudinary.",
        result,
      });
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return res.status(500).json({
      message: "Error deleting file from Cloudinary.",
      error: error.message,
    });
  }
};
