const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2; // Use v2 for modern Cloudinary features
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors"); // Import the cors package

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- Configure CORS Middleware ---
// let URL = "http://localhost:5173";
let URL = "https://tohfabox25.vercel.app";
const corsOptions = {
  origin: URL, // IMPORTANT: Replace with your React app's actual URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Limit file size to 100MB (Cloudinary free tier max for video)
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"), false);
    }
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Endpoint for File Upload ---
app.post("/upload", upload.single("media"), async (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const { originalname, buffer, mimetype } = req.file;

  try {
    const resourceType = mimetype.startsWith("video/") ? "video" : "image";

    // FIX: Use template literals (backticks) for proper string interpolation
    // This creates a publicId like "image_1678888888888_my_photo" or "video_1678888888888_my_video"
    const publicId = `${resourceType}_${Date.now()}_${path
      .parse(originalname)
      .name.replace(/\s/g, "_")}`;

    const uploadOptions = {
      resource_type: resourceType,
      public_id: publicId,
      folder: `uploads/${resourceType}s`, // Organizes files in folders like 'uploads/images' or 'uploads/videos'
      // You can add more transformations or options here if needed, e.g., eager transformations for videos
    };

    // Create a write stream to Cloudinary
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

        // Respond with the Cloudinary URL and other details
        res.status(200).json({
          message: "File uploaded successfully!",
          publicId: result.public_id,
          url: result.secure_url, // Use secure_url for HTTPS
          thumbnailUrl:
            resourceType === "video" ? result.thumbnail_url : result.secure_url, // Video thumbnails
          format: result.format,
          resourceType: result.resource_type,
          bytes: result.bytes,
        });
      }
    );

    // Pipe the file buffer into the Cloudinary upload stream
    cloudinaryStream.end(buffer);
  } catch (error) {
    console.error("Server error during upload process:", error);
    res.status(500).json({
      message: "Internal server error during file upload.",
      error: error.message,
    });
  }
});

// --- API Endpoint to Fetch All Images and Videos from Cloudinary ---
app.get("/media", async (req, res) => {
  try {
    // Fetch images
    const imageResources = await cloudinary.api.resources({
      type: "upload", // 'upload' for assets uploaded by you
      prefix: "uploads/images/", // Fetch from the 'uploads/images' folder
      resource_type: "image",
      max_results: 100, // Adjust max_results as needed, or implement pagination
    });

    // Fetch videos
    const videoResources = await cloudinary.api.resources({
      type: "upload",
      prefix: "uploads/videos/", // Fetch from the 'uploads/videos' folder
      resource_type: "video",
      max_results: 100, // Adjust max_results as needed, or implement pagination
    });

    // Combine and send relevant data
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
});

// DELETE API to remove a file from Cloudinary
app.delete("/delete", async (req, res) => {
  const { publicId, resourceType } = req.body;

  if (!publicId) {
    return res
      .status(400)
      .json({ message: "Missing publicId in request body." });
  }
  if (!resourceType) {
    return res
      .status(400)
      .json({ message: "Missing resourceType in request body." });
  }

  try {
    // Delete the resource from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType, // 'image' or 'video'
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
});

// --- Simple Health Check / Root Endpoint ---
app.get("/", (req, res) => {
  res.status(200).send("Cloudinary Upload Backend is running!");
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server running on : ${port}`);
  console.log(
    "Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your .env file."
  );
});
