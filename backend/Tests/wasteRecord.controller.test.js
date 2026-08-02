/**
 * backend/Tests/waste.controller.test.js
 * Unit tests for addWasteRecord and getAllWasteRecords in controllers/wasteController.js
 */

jest.mock("../models/WasteRecord", () => ({
  create: jest.fn(),
  find: jest.fn(),
}));

const WasteRecord = require("../models/WasteRecord");

// ⬇️ Path matches your file: backend/controllers/wasteController.js
const {
  addWasteRecord,
  getAllWasteRecords,
} = require("../controllers/wasteController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe("wasteController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addWasteRecord", () => {
    test("201 -> returns created record", async () => {
      const body = {
        area: "Colombo",
        wasteType: "Plastic",
        quantity: 12,
        collectionDate: new Date("2025-01-01T10:00:00Z"),
      };
      const created = { _id: "wr1", ...body };

      WasteRecord.create.mockResolvedValue(created);

      const req = { body };
      const res = mockRes();

      await addWasteRecord(req, res);

      expect(WasteRecord.create).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    test("400 -> when create rejects", async () => {
      WasteRecord.create.mockRejectedValue(new Error("validation failed"));

      const req = { body: {} };
      const res = mockRes();

      await addWasteRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to add record",
        error: "validation failed",
      });
    });
  });

  describe("getAllWasteRecords", () => {
    test("200 -> returns list of records", async () => {
      const records = [
        { _id: "wr1", area: "Colombo" },
        { _id: "wr2", area: "Kandy" },
      ];

      WasteRecord.find.mockResolvedValue(records);

      const req = {};
      const res = mockRes();

      await getAllWasteRecords(req, res);

      expect(WasteRecord.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(records);
    });

    test("500 -> when find rejects", async () => {
      WasteRecord.find.mockRejectedValue(new Error("db down"));

      const req = {};
      const res = mockRes();

      await getAllWasteRecords(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch records",
        error: "db down",
      });
    });
  });
});
