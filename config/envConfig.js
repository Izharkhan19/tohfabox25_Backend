const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config(); // Ensure dotenv is configured for this file too

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define JWT Secret (read from .env)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // IMPORTANT: Change this for production!

// Define URL for CORS (read from .env or hardcoded example)
const URL = process.env.CLIENT_URL || "https://tohfabox25.vercel.app";
// For local development, you might set CLIENT_URL="http://localhost:5173" in your .env

module.exports = {
  cloudinary,
  JWT_SECRET,
  URL,
};
