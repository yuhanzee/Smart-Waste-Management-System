const slotService = require("../services/slotService");

exports.createSlot = async (req, res) => {
  try {
    const slot = await slotService.createSlot(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSlots = async (req, res) => {
  try {
    const { date, area } = req.query;
    const slots = await slotService.getSlots({ date, area });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { isAvailable } = req.body;
    const slot = await slotService.updateSlotAvailability(slotId, isAvailable);
    res.json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSlotResources = async (req, res) => {
  try {
    const data = await slotService.getSlotResources();
    res.json(data);
  } catch (err) {
    console.error("Error fetching slot resources:", err);
    res.status(500).json({ message: "Error loading slot resources" });
  }
};