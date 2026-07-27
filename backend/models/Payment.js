const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "SpecialCollection" },
  method: { type: String, enum: ["visa", "master"], default: "visa" },
  mode: { type: String, enum: ["Card", "Wallet", "Cash"], default: "Card" },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Success", "Failed", "Pending"], default: "Success" },
  transactionId: { type: String, unique: true },
  description: { type: String, default: "Special collection payment" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
