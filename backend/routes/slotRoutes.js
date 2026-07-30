const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slotController");

router.post("/", slotController.createSlot);
router.get("/", slotController.getSlots);
router.put("/:slotId/availability", slotController.updateAvailability);
router.get("/resources", slotController.getSlotResources);


module.exports = router;
