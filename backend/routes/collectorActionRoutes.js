const express = require("express");
const router = express.Router();

const {
  logAction,
  getAllActions,
  getActionsByCollector,
} = require("../controllers/collectorActionController");

router.post("/", logAction);
router.get("/", getAllActions);
router.get("/:collectorName", getActionsByCollector);

module.exports = router;
