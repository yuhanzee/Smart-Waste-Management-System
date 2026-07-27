const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  area: { type: String, required: false },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  assignedTruck: { type: mongoose.Schema.Types.ObjectId, ref: "Truck" },
  assignedCollector: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // role - collector
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Slot", slotSchema);
