const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema({
  truckNo: { type: String, required: true, unique: true },
  capacity: Number,
  status: { type: String, enum: ["available", "busy"], default: "available" },
  collector: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
}, { timestamps: true });

module.exports = mongoose.model("Truck", truckSchema);
