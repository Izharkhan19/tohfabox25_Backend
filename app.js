const express = require("express");
const cors = require("cors");
const mediaRoutes = require("./routes/mediaRoutes");
const { URL } = require("./config/cloudinaryConfig"); // Assuming URL is defined there, or define it here if preferred

const app = express();

// --- Configure CORS Middleware ---
const corsOptions = {
  origin: URL, // IMPORTANT: Replace with your React app's actual URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Endpoints ---
app.use("/api", mediaRoutes); // All media-related routes will be prefixed with /api

// --- Simple Health Check / Root Endpoint ---
app.get("/", (req, res) => {
  res.status(200).send("Cloudinary Upload Backend is running!");
});

module.exports = app;