const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import User model
const { JWT_SECRET } = require("../config/envConfig"); // Import JWT_SECRET

// POST /signup - Register a new user
exports.signup = async (req, res) => {
  const { userName, email, password, role } = req.body;
  if ((!userName, !email || !password)) {
    return res
      .status(400)
      .json({ message: "Username, Email and password are required." });
  }

  // Basic role validation: only 'admin' or 'client'
  // Example: 'admin' role can only be assigned if the email ends with '@admin.com'
  // const userRole = (role === 'admin' && email.endsWith('@admin.com')) ? 'admin' : 'client';
  const userRole = role === "admin" ? "admin" : "client";

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds for salt

    // Create new user in MongoDB
    const newUser = await User.create({
      userName: userName,
      email: email,
      passwordHash: hashedPassword,
      role: userRole,
    });

    res.status(201).json({
      message: "User registered successfully!",
      userId: newUser._id,
      role: newUser.role,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ message: "Server error during signup.", error: error.message });
  }
};

// POST /signin - Authenticate a user and return a JWT
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // Find user by email in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      }, // Use user._id for MongoDB document ID
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.status(200).json({
      message: "Signed in successfully!",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res
      .status(500)
      .json({ message: "Server error during signin.", error: error.message });
  }
};
