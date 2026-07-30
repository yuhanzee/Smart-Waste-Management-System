const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");

const MAX_CAPACITY_KG = 30;

const getStatus = (level) => {
  if (level >= 100) return "Full";
  if (level >= 80) return "Reaching to Full";
  if (level >= 50) return "Moderate";
  return "Normal";
};

const getQuantity = (level) => (level / 100) * MAX_CAPACITY_KG;

router.get("/", async (req, res) => {
  try {
    const bins = await Bin.find().populate("userId", "name role email");
    res.json(bins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, lat, lng, city, userId, level = 0, wasteType } = req.body;

    if (!wasteType) {
      return res.status(400).json({ error: "Waste type is required" });
    }

    const status = getStatus(level);
    const quantity = getQuantity(level);

    const bin = new Bin({
      name,
      lat,
      lng,
      city,
      userId,
      level,
      quantity,
      wasteType,
      status,
    });

    await bin.save();
    const populatedBin = await bin.populate("userId", "name role email");

    res.status(201).json(populatedBin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { level, wasteType } = req.body;

    const updateData = { ...req.body };

    if (level !== undefined) {
      updateData.status = getStatus(level);
      updateData.quantity = getQuantity(level);
    }

    if (wasteType && !["E-Waste", "Plastic", "Organic", "Hazardous", "Other"].includes(wasteType)) {
      return res.status(400).json({ error: "Invalid waste type" });
    }

    const bin = await Bin.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("userId", "name role email");

    if (!bin) return res.status(404).json({ message: "Bin not found" });

    res.json(bin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Bin.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Bin not found" });
    res.json({ message: "Bin deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
