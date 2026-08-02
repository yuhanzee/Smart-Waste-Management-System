const Slot = require("../models/Slot");
const Truck = require("../models/Truck");
const User = require("../models/User");

// Create a new slot
exports.createSlot = async (data) => {
  const { date, startTime, endTime, area, assignedTruck, assignedCollector } = data;

  const truck = await Truck.findById(assignedTruck);
  if (!truck) throw new Error("Truck not found");

  const slot = await Slot.create({
    date,
    startTime,
    endTime,
    area,
    assignedTruck,
    assignedCollector,
    isAvailable: true
  });

  return await slot.populate(["assignedTruck", "assignedCollector"]);
};

// Fetch all slots
exports.getSlots = async (filters = {}) => {
  const query = {};
  if (filters.date) query.date = filters.date;

  return await Slot.find(query)
    .populate("assignedTruck", "truckNo capacity status")
    .populate("assignedCollector", "name email role");
};

// Mark slot as unavailable
exports.updateSlotAvailability = async (slotId, available) => {
  const slot = await Slot.findById(slotId);
  if (!slot) throw new Error("Slot not found");
  slot.isAvailable = available;
  await slot.save();
  return slot;
};

exports.getSlotResources = async () => {
  try {
    const collectors = await User.find({ role: "collector" }, "name email");
    const trucks = await Truck.find({}, "truckNo capacity status");
    return { collectors, trucks };
  } catch (err) {
    console.error("Error fetching slot resources:", err);
    throw err;
  }
};
