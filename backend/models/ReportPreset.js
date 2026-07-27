const mongoose = require("mongoose");

const ReportPresetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  params: {
    startDate: String,
    endDate: String,
    area: String,
    wasteType: String,
  },
});

module.exports = mongoose.model("ReportPreset", ReportPresetSchema);
