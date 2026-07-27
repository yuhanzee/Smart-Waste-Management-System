const mongoose = require("mongoose");

const specialCollectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },                
  address: { type: String, required: true },   
  area: { type: String, required: false },          
  userType: {                                            
    type: String,
    enum: ["resident", "business"],
    required: true
  },

  wasteType: {
    type: String,
    enum: ["Bulky Waste", "E-waste", "Garden Waste", "Other"],
    required: true
  },
  quantity: { type: Number, required: true, min: 1 },

  preferredDate: String,
  slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot" },  
  fee: { type: Number, default: 0 },

  requestStatus: {   
    type: String,
    enum: ["Pending", "Scheduled", "Completed", "Cancelled"],
    default: "Pending"
  },
  paymentStatus: {   
    type: String,
    enum: ["Unpaid", "Paid", "Failed"],
    default: "Unpaid"
  },

}, { timestamps: true });

module.exports = mongoose.model("SpecialCollection", specialCollectionSchema);
