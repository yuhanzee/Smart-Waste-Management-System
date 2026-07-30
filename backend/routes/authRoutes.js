// routes/authRoutes.js
const express = require("express");
const { registerUser, registerAdmin,registerCollector,loginUser } = require("../controllers/authController");

const router = express.Router();

// User Registration Route
router.post("/register", registerUser);

// Admin Registration Route
router.post("/register-admin", registerAdmin);

router.post("/register-collector", registerCollector);

// Login Route
router.post("/login", loginUser);

module.exports = router;
