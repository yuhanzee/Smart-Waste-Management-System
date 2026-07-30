const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

router.post("/requests", scheduleController.createPickupRequest);
router.get("/requests", scheduleController.getAllRequests);
router.get("/requests/:userId", scheduleController.getUserRequests);
router.put("/requests/:requestId/status", scheduleController.updateStatus);

module.exports = router;
