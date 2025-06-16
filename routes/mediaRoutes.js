const express = require("express");
const mediaController = require("../controllers/mediaController");
const upload = require("../middleware/uploadMiddleware"); // Import Multer upload middleware
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware"); // Import auth middleware

const router = express.Router();

// Protected routes
router.post("/upload", authenticateToken, authorizeRoles('admin', 'client'), upload.single("media"), mediaController.uploadMedia);
router.get("/media", authenticateToken, authorizeRoles('admin', 'client'), mediaController.getAllMedia);
router.delete("/delete", authenticateToken, authorizeRoles('admin'), mediaController.deleteMedia);

module.exports = router;
