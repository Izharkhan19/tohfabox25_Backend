const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/envConfig"); // Import JWT_SECRET

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "Authentication token required." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user; // Attach user payload to the request (id, email, role)
    next(); // Proceed to the next middleware/route handler
  });
};

// Middleware for role-based authorization
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied. User role not found." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of: ${allowedRoles.join(', ')} roles.` });
    }
    next(); // User has the required role, proceed
  };
};

module.exports = { authenticateToken, authorizeRoles };
