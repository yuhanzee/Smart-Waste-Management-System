/**
 * backend/__tests__/collectorAction.controller.test.js
 * Unit tests for CollectorAction controllers (Jest + mocked models).
 */

jest.mock("../models/CollectorAction", () => {
  // Mock constructor used by: new CollectorAction({...})
  const CollectorAction = jest.fn(function (data) {
    return { ...data, save: jest.fn().mockResolvedValue(true) };
  });

  // Mock static .find()
  // We'll assign implementations per-test to return an object with .sort()
  CollectorAction.find = jest.fn();

  return CollectorAction;
});

jest.mock("../models/WasteRecord", () => ({
  create: jest.fn(),
}));

const CollectorAction = require("../models/CollectorAction");
const WasteRecord = require("../models/WasteRecord");

// ⬇️ Adjust this path to match your actual controller file:
const {
  logAction,
  getAllActions,
  getActionsByCollector,
} = require("../controllers/collectorActionController"); // e.g. "../controllers/collectorActionController" or "../controllers/collectorAction"

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("CollectorAction controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logAction", () => {
    const body = {
      collectorName: "Kamal",
      binName: "BIN-12",
      city: "Colombo",
      wasteType: "Plastic",
      quantity: 25,
    };

    test("201 -> creates CollectorAction + WasteRecord", async () => {
      WasteRecord.create.mockResolvedValue({ _id: "w1" });

      const req = { body };
      const res = mockRes();

      await logAction(req, res);

      // constructor called with body
      expect(CollectorAction).toHaveBeenCalledTimes(1);
      expect(CollectorAction).toHaveBeenCalledWith(body);

      // instance.save called
      const instance = CollectorAction.mock.results[0].value;
      expect(instance.save).toHaveBeenCalledTimes(1);

      // WasteRecord.create called with derived fields
      expect(WasteRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          area: "Colombo",
          wasteType: "Plastic",
          quantity: 25,
          collectionDate: expect.any(Date),
        })
      );

      // response 201
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Collector action and waste record logged successfully",
        newAction: instance,
      });
    });

    test("500 -> if CollectorAction constructor throws", async () => {
      CollectorAction.mockImplementationOnce(() => {
        throw new Error("ctor failed");
      });

      const req = { body };
      const res = mockRes();

      await logAction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "ctor failed" });
    });

    test("500 -> if save() rejects", async () => {
      CollectorAction.mockImplementationOnce(function (data) {
        return { ...data, save: jest.fn().mockRejectedValue(new Error("save failed")) };
      });

      const req = { body };
      const res = mockRes();

      await logAction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "save failed" });
    });

    test("500 -> if WasteRecord.create rejects", async () => {
      WasteRecord.create.mockRejectedValue(new Error("create failed"));

      const req = { body };
      const res = mockRes();

      await logAction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "create failed" });
    });

    test("uses defaults when fields missing", async () => {
      WasteRecord.create.mockResolvedValue({ _id: "w2" });

      const minimalBody = { collectorName: "Kamal" };
      const req = { body: minimalBody };
      const res = mockRes();

      await logAction(req, res);

      expect(WasteRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          area: "Unknown",
          wasteType: "Other",
          quantity: 0,
          collectionDate: expect.any(Date),
        })
      );
    });
  });

  describe("getAllActions", () => {
    test("200 -> returns sorted actions", async () => {
      const docs = [{ _id: "a1" }, { _id: "a2" }];

      // find() returns an object with .sort() that resolves to docs
      CollectorAction.find.mockImplementation(() => ({
        sort: jest.fn().mockResolvedValue(docs),
      }));

      const req = {};
      const res = mockRes();

      await getAllActions(req, res);

      expect(CollectorAction.find).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(docs);
      // (status is not set in controller on success, which is fine: defaults to 200)
    });

    test("500 -> if find().sort() rejects", async () => {
      CollectorAction.find.mockImplementation(() => ({
        sort: jest.fn().mockRejectedValue(new Error("db down")),
      }));

      const req = {};
      const res = mockRes();

      await getAllActions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "db down" });
    });
  });

  describe("getActionsByCollector", () => {
    test("200 -> returns filtered & sorted actions", async () => {
      const docs = [{ _id: "x1", collectorName: "Kamal" }];
      const sortMock = jest.fn().mockResolvedValue(docs);

      CollectorAction.find.mockImplementation((query) => {
        // verify query shape
        expect(query).toEqual({ collectorName: "Kamal" });
        return { sort: sortMock };
      });

      const req = { params: { collectorName: "Kamal" } };
      const res = mockRes();

      await getActionsByCollector(req, res);

      expect(CollectorAction.find).toHaveBeenCalledWith({ collectorName: "Kamal" });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(docs);
    });

    test("500 -> if find().sort() rejects", async () => {
      CollectorAction.find.mockImplementation(() => ({
        sort: jest.fn().mockRejectedValue(new Error("bad query")),
      }));

      const req = { params: { collectorName: "Kamal" } };
      const res = mockRes();

      await getActionsByCollector(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "bad query" });
    });
  });
});
