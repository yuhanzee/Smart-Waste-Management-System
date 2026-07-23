const scheduleService = require("../services/scheduleService");
const SpecialCollection = require("../models/SpecialCollection");

exports.createPickupRequest = async (req, res) => {
  try {
    const result = await scheduleService.createPickupRequest(req.body);

    if (result.blocked) {
      return res.status(200).json({
        success: false,
        message: result.message,
        unpaidRequestId: result.unpaidRequestId,
      });
    }

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error("Error creating pickup request:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong creating request." });
  }
};

exports.getUserRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await scheduleService.getUserRequests(userId);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const updated = await scheduleService.updateRequestStatus(requestId, status);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all special collection requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await scheduleService.getAllRequests();
    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching all requests:", err);
    res.status(500).json({ msg: err.message });
  }
};