const fs = require("fs");
const path = require("path");
const WasteRecord = require("../models/WasteRecord");
const ReportPreset = require("../models/ReportPreset");

// We don’t use config.js, so define constants here:
const APP_CONFIG = {
  EXPORT_DIR: "exports",
  REPORT_FILE_PREFIX: "report_",
  DATE_DELIMITER: "T",
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  },
  ERROR_MESSAGES: {
    INVALID_PARAMS: "Invalid parameters. Please check date range and filters.",
    GENERATE_FAIL: "Failed to generate report",
    EXPORT_FAIL: "Failed to export report",
  },
};


const validateParams = ({ startDate, endDate }) => {
  if (!startDate || !endDate) return false;
  const s = new Date(startDate);
  const e = new Date(endDate);
  return s.toString() !== "Invalid Date" && e.toString() !== "Invalid Date" && s <= e;
};

const buildFilter = ({ startDate, endDate, area, wasteType }) => {
  const filter = {};
  if (startDate && endDate) {
    filter.collectionDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (area) filter.area = area;
  if (wasteType) filter.wasteType = wasteType;
  return filter;
};

const aggregateByDay = (records) => {
  const results = {};
  for (const r of records) {
    const day = r.collectionDate.toISOString().split(APP_CONFIG.DATE_DELIMITER)[0];
    results[day] = (results[day] || 0) + r.quantity;
  }
  return results;
};

const toCsv = (records) => {
  if (Array.isArray(records)) {
    const header = "Date,Area,WasteType,Quantity";
    const rows = records.map(
      (r) =>
        `${r.collectionDate.toISOString().split(APP_CONFIG.DATE_DELIMITER)[0]},${r.area},${r.wasteType},${r.quantity}`
    );
    return [header, ...rows].join("\n");
  }
  const header = "Date,TotalQuantity";
  const rows = Object.entries(records).map(([date, qty]) => `${date},${qty}`);
  return [header, ...rows].join("\n");
};

const saveCsv = (csv) => {
  fs.mkdirSync(APP_CONFIG.EXPORT_DIR, { recursive: true });
  const filename = `${APP_CONFIG.REPORT_FILE_PREFIX}${Date.now()}.csv`;
  const filePath = path.join(APP_CONFIG.EXPORT_DIR, filename);
  fs.writeFileSync(filePath, csv, "utf8");
  return filePath;
};


const getFilterMetadata = async (_req, res) => {
  try {
    const areas = await WasteRecord.distinct("area");
    const wasteTypes = await WasteRecord.distinct("wasteType");
    return res.status(APP_CONFIG.HTTP_STATUS.OK).json({ areas, wasteTypes });
  } catch (err) {
    return res
      .status(APP_CONFIG.HTTP_STATUS.SERVER_ERROR)
      .json({ message: "Failed to load filters", error: err?.message });
  }
};

const getPreset = async (req, res) => {
  try {
    const preset = await ReportPreset.findOne({ name: req.params.name });
    if (!preset) {
      return res
        .status(APP_CONFIG.HTTP_STATUS.NOT_FOUND)
        .json({ message: "Preset not found" });
    }
    return res.status(APP_CONFIG.HTTP_STATUS.OK).json(preset);
  } catch (err) {
    return res
      .status(APP_CONFIG.HTTP_STATUS.SERVER_ERROR)
      .json({ message: "Failed to load preset", error: err?.message });
  }
};

const createPreset = async (req, res) => {
  try {
    const preset = await ReportPreset.create(req.body);
    return res.status(APP_CONFIG.HTTP_STATUS.CREATED).json(preset);
  } catch (err) {
    return res
      .status(APP_CONFIG.HTTP_STATUS.BAD_REQUEST)
      .json({ message: "Failed to create preset", error: err?.message });
  }
};

const generateReport = async (req, res) => {
  try {
    if (!validateParams(req.query)) {
      return res
        .status(APP_CONFIG.HTTP_STATUS.BAD_REQUEST)
        .json({ message: APP_CONFIG.ERROR_MESSAGES.INVALID_PARAMS });
    }

    const filter = buildFilter(req.query);
    const records = await WasteRecord.find(filter).lean();

    const statsByDay = aggregateByDay(records);

    return res.status(APP_CONFIG.HTTP_STATUS.OK).json({
      success: true,
      params: req.query,
      statsByDay,
      totalRecords: records.length,
    });
  } catch (err) {
    return res
      .status(APP_CONFIG.HTTP_STATUS.SERVER_ERROR)
      .json({ message: APP_CONFIG.ERROR_MESSAGES.GENERATE_FAIL, error: err?.message });
  }
};

const exportReportCsv = async (req, res) => {
  try {
    if (!validateParams(req.query)) {
      return res
        .status(APP_CONFIG.HTTP_STATUS.BAD_REQUEST)
        .json({ message: APP_CONFIG.ERROR_MESSAGES.INVALID_PARAMS });
    }

    const filter = buildFilter(req.query);
    const mode = (req.query.mode || "agg").toLowerCase();

    const records = await WasteRecord.find(filter).lean();
    const csv = mode === "raw" ? toCsv(records) : toCsv(aggregateByDay(records));
    const filePath = saveCsv(csv);

    return res.status(APP_CONFIG.HTTP_STATUS.OK).json({
      success: true,
      downloadLink: `/${filePath}`,
    });
  } catch (err) {
    return res
      .status(APP_CONFIG.HTTP_STATUS.SERVER_ERROR)
      .json({ message: APP_CONFIG.ERROR_MESSAGES.EXPORT_FAIL, error: err?.message });
  }
};

// Export all functions for routes
module.exports = {
  getFilterMetadata,
  getPreset,
  createPreset,
  generateReport,
  exportReportCsv,
};
