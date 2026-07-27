const mongoose = require("mongoose");

const WasteRecordSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
  },
  wasteType: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  collectionDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("WasteRecord", WasteRecordSchema);
