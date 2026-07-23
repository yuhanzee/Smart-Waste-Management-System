const WasteRecord = require("../models/WasteRecord");

// Add a new waste record
exports.addWasteRecord = async (req, res) => {
  try {
    const record = await WasteRecord.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: "Failed to add record", error: error.message });
  }
};

// Get all waste records
exports.getAllWasteRecords = async (_req, res) => {
  try {
    const records = await WasteRecord.find();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch records", error: error.message });
  }
};
