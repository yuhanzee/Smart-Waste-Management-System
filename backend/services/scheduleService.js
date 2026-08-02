const Slot = require("../models/Slot");
const Truck = require("../models/Truck");
const SpecialCollection = require("../models/SpecialCollection");

// create a new pickup request
exports.createPickupRequest = async (data) => {
  const {
    user, name, address, userType, wasteType,
    quantity, preferredDate, slotId, fee
  } = data;

  const unpaid = await SpecialCollection.findOne({
    user,
    paymentStatus: "Unpaid",
    requestStatus: { $ne: "Cancelled" }
  });

  if (unpaid) {
    console.log("Unpaid request found for user:", user, unpaid._id);
    return {
      blocked: true,
      message: "You already have an unpaid special collection. Please complete payment before making a new request.",
      unpaidRequestId: unpaid._id
    };
  }

  const slot = await Slot.findById(slotId);
  if (!slot) return { blocked: true, message: "Invalid slot selected." };

  slot.isAvailable = false;
  await slot.save();

  const request = await SpecialCollection.create({
    user, name, address, userType, wasteType,
    quantity, preferredDate, slot: slot._id, fee,
    requestStatus: "Scheduled", paymentStatus: "Unpaid"
  });

  return await request.populate({
    path: "slot",
    populate: [{ path: "assignedTruck" }, { path: "assignedCollector" }]
  });
};

// get all requests by user
exports.getUserRequests = async (userId) => {
  return await SpecialCollection.find({ user: userId })
    .populate({
      path: "slot",
      populate: [{ path: "assignedTruck" }, { path: "assignedCollector" }]
    })
    .sort({ createdAt: -1 });
};

// update request status
exports.updateRequestStatus = async (requestId, status) => {
  const req = await SpecialCollection.findById(requestId);
  if (!req) throw new Error("Request not found.");
  req.requestStatus = status;
  await req.save();
  return req;
};

exports.getAllRequests = async () => {
  try {
    const requests = await SpecialCollection.find()
      .populate("user", "name email")
      .populate("slot", "date startTime endTime")
      .sort({ createdAt: -1 });
    return requests;
  } catch (err) {
    throw new Error("Failed to fetch special collection requests: " + err.message);
  }
};