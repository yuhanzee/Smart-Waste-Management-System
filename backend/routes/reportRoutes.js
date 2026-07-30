// // routes/reportRoutes.js
// import express from "express";
// import {
//   getFilterMetadata,
//   getPreset,
//   createPreset,
//   generateReport,
//   exportReportCsv,
// } from "../controllers/reportController.js";

// const router = express.Router();

// // Filters/presets
// router.get("/filters", getFilterMetadata);
// router.get("/presets/:name", getPreset);
// router.post("/presets", createPreset);

// // Reports
// router.get("/generate", generateReport);
// router.get("/export/csv", exportReportCsv);

// export default router;


const express = require("express");
const {
  getFilterMetadata,
  getPreset,
  createPreset,
  generateReport,
  exportReportCsv,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/filters", getFilterMetadata);
router.get("/presets/:name", getPreset);
router.post("/presets", createPreset);
router.get("/generate", generateReport);
router.get("/export/csv", exportReportCsv);

module.exports = router;

