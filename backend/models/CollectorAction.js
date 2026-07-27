const mongoose = require("mongoose");

const collectorActionSchema = new mongoose.Schema(
  {
    collectorName: { type: String, required: true },
    binName: { type: String, required: true },
    city: { type: String },
    wasteType: { type: String },
    quantity: { type: Number },
    collectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CollectorAction", collectorActionSchema);
