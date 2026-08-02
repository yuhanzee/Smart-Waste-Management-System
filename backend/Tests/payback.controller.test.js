/**
 * backend/__tests__/payback.controller.test.js
 * Unit tests for payback controllers using a mocked Mongoose model.
 */

jest.mock("../models/paybackM", () => {
  // Mocked constructor for new Payback({...})
  const Payback = jest.fn(function (data) {
    return { ...data, save: jest.fn().mockResolvedValue(true) };
  });

  // Mock static methods
  Payback.find = jest.fn();
  Payback.findById = jest.fn();

  return Payback;
});

const Payback = require("../models/paybackM"); // mocked model constructor
const {
  getAllPayback,
  addPayback,
  getByPaybackID,
} = require("../controllers/paybackC"); // <-- uses your path/name

// Helpers for req/res/next
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = () => jest.fn();

describe("Payback controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllPayback", () => {
    test("200 -> returns list when found", async () => {
      const docs = [{ _id: "1" }, { _id: "2" }];
      Payback.find.mockResolvedValue(docs);

      const req = {};
      const res = mockRes();

      await getAllPayback(req, res, mockNext());

      expect(Payback.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ paybacks: docs });
    });

    test("404 -> when find() returns undefined/null", async () => {
      Payback.find.mockResolvedValue(undefined);

      const req = {};
      const res = mockRes();

      await getAllPayback(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "paybacks are not found" });
    });

    test("404 -> when find() throws", async () => {
      Payback.find.mockRejectedValue(new Error("db down"));

      const req = {};
      const res = mockRes();

      await getAllPayback(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "paybacks are not found" });
    });
  });

  describe("addPayback", () => {
    const body = {
      quantity: 10,
      wasteType: "plastic",
      bankname: "ABC",
      branch: "Colombo",
      branchCode: "001",
      accountNumber: "1234567890",
    };

    test("200 -> creates and returns Payback", async () => {
      const req = { body };
      const res = mockRes();

      await addPayback(req, res, mockNext());

      // constructor called with body
      expect(Payback).toHaveBeenCalledTimes(1);
      expect(Payback).toHaveBeenCalledWith(body);

      // instance.save() called
      const instance = Payback.mock.results[0].value;
      expect(instance.save).toHaveBeenCalledTimes(1);

      // response 200 with created doc
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ Payback: instance });
    });

    test("404 -> when constructor throws", async () => {
      Payback.mockImplementationOnce(() => {
        throw new Error("ctor failed");
      });

      const req = { body };
      const res = mockRes();

      await addPayback(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "payback not inserted" });
    });

    test("⚠ current logic: still 200 when save() rejects", async () => {
      // With your current controller, newPayback is set before save(),
      // so even if save() rejects, it returns 200 (likely a bug).
      Payback.mockImplementation(function (data) {
        return { ...data, save: jest.fn().mockRejectedValue(new Error("save failed")) };
      });

      const req = { body };
      const res = mockRes();

      await addPayback(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(200); // current behavior
      expect(res.json).toHaveBeenCalled();          // returns Payback: {data}
    });
  });

  describe("getByPaybackID", () => {
    test("200 -> returns document when found", async () => {
      const doc = { _id: "abc123", quantity: 5 };
      Payback.findById.mockResolvedValue(doc);

      const req = { params: { id: "abc123" } };
      const res = mockRes();

      await getByPaybackID(req, res, mockNext());

      expect(Payback.findById).toHaveBeenCalledWith("abc123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ Payback: doc });
    });

    test("404 -> when findById returns null", async () => {
      Payback.findById.mockResolvedValue(null);

      const req = { params: { id: "zzz" } };
      const res = mockRes();

      await getByPaybackID(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "request not available" });
    });

    test("404 -> when findById throws", async () => {
      Payback.findById.mockRejectedValue(new Error("bad id"));

      const req = { params: { id: "bad" } };
      const res = mockRes();

      await getByPaybackID(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "request not available" });
    });
  });
});
