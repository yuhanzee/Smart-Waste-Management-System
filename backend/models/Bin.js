const mongoose = require("mongoose");

const binSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    city: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    level: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 }, 
    wasteType: {
      type: String,
      enum: ["E-Waste", "Plastic", "Organic", "Hazardous", "Other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Normal", "Moderate", "Reaching to Full", "Full"],
      default: "Normal",
    },
  },
  { timestamps: true }
);

binSchema.pre("save", function (next) {
  this.quantity = (this.level / 100) * 30; 
  next();
});

module.exports = mongoose.model("Bin", binSchema);
