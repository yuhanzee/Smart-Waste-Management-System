
// wasteRoutes.js
const express = require("express");
const router = express.Router();
const WasteRecord = require("../models/WasteRecord");

// existing routes
router.post("/", async (req, res) => {
  try {
    const record = await WasteRecord.create(req.body);
    res.status(201).json({ record });
  } catch (err) {
    res.status(400).json({ message: "Error adding record", error: err.message });
  }
});

router.get("/", async (_req, res) => {
  const records = await WasteRecord.find().sort({ collectionDate: -1 });
  res.status(200).json(records);
});

// ✏️ Update
router.put("/:id", async (req, res) => {
  try {
    const updated = await WasteRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// 🗑️ Delete
router.delete("/:id", async (req, res) => {
  try {
    await WasteRecord.findByIdAndDelete(req.params.id);
    res.json({ message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;
