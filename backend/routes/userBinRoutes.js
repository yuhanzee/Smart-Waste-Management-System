const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");

// Max bin capacity constant (same logic as admin)
const MAX_CAPACITY_KG = 30;

// ✅ Get bin assigned to a user
router.get("/:userId", async (req, res) => {
  try {
    const bin = await Bin.findOne({ userId: req.params.userId });
    if (!bin) return res.status(404).json({ message: "No bin assigned to this user" });
    res.json(bin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update waste type / quantity / level for a user’s bin
router.put("/:userId", async (req, res) => {
  try {
    const { wasteType, quantity, level } = req.body;

    // Recalculate level if not explicitly provided
    let updatedLevel = level;
    if (quantity !== undefined) {
      updatedLevel = Math.min((quantity / MAX_CAPACITY_KG) * 100, 100);
    }

    // Derive status from level
    let status = "Normal";
    if (updatedLevel >= 100) status = "Full";
    else if (updatedLevel >= 80) status = "Reaching to Full";
    else if (updatedLevel >= 50) status = "Moderate";

    const bin = await Bin.findOneAndUpdate(
      { userId: req.params.userId },
      { wasteType, quantity, level: updatedLevel, status },
      { new: true }
    );

    if (!bin) return res.status(404).json({ message: "Bin not found" });

    res.json(bin);
  } catch (err) {
    console.error("Error updating user bin:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
