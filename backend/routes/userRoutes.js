const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Get all users (safe data only)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
