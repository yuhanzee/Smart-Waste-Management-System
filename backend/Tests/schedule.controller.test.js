/**
 * backend/Tests/schedule.controller.test.js
 * Unit tests for controllers/scheduleController.js
 */

jest.mock("../services/scheduleService", () => ({
  createPickupRequest: jest.fn(),
  getUserRequests: jest.fn(),
  updateRequestStatus: jest.fn(),
  getAllRequests: jest.fn(),
}));

const scheduleService = require("../services/scheduleService");

// ⬇️ Path matches your file location
const {
  createPickupRequest,
  getUserRequests,
  updateStatus,
  getAllRequests,
} = require("../controllers/scheduleController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe("scheduleController", () => {
  // Optional: silence console noise during tests (remove if you want to see logs)
  const origError = console.error;
  beforeAll(() => (console.error = jest.fn()));
  afterAll(() => (console.error = origError));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createPickupRequest", () => {
    test("201 -> returns success true with created data", async () => {
      const body = { userId: "u1", date: "2025-10-25", area: "Colombo" };
      const created = { id: "req_1", ...body };

      scheduleService.createPickupRequest.mockResolvedValue(created);

      const req = { body };
      const res = mockRes();

      await createPickupRequest(req, res);

      expect(scheduleService.createPickupRequest).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: created });
    });

    test("200 -> blocked flow (success false + unpaidRequestId)", async () => {
      const body = { userId: "u2" };
      const blocked = {
        blocked: true,
        message: "Pending unpaid request.",
        unpaidRequestId: "req_unpaid_9",
      };

      scheduleService.createPickupRequest.mockResolvedValue(blocked);

      const req = { body };
      const res = mockRes();

      await createPickupRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Pending unpaid request.",
        unpaidRequestId: "req_unpaid_9",
      });
    });

    test("500 -> when service throws", async () => {
      scheduleService.createPickupRequest.mockRejectedValue(new Error("db down"));

      const req = { body: { userId: "u3" } };
      const res = mockRes();

      await createPickupRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Something went wrong creating request.",
      });
    });
  });

  describe("getUserRequests", () => {
    test("200 -> returns user requests", async () => {
      const list = [{ id: "r1" }, { id: "r2" }];
      scheduleService.getUserRequests.mockResolvedValue(list);

      const req = { params: { userId: "u1" } };
      const res = mockRes();

      await getUserRequests(req, res);

      expect(scheduleService.getUserRequests).toHaveBeenCalledWith("u1");
      // controller returns json directly; implicit 200
      expect(res.json).toHaveBeenCalledWith(list);
    });

    test("500 -> when service throws", async () => {
      scheduleService.getUserRequests.mockRejectedValue(new Error("fail"));

      const req = { params: { userId: "uX" } };
      const res = mockRes();

      await getUserRequests(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "fail" });
    });
  });

  describe("updateStatus", () => {
    test("200 -> returns updated item", async () => {
      const updated = { id: "r9", status: "APPROVED" };
      scheduleService.updateRequestStatus.mockResolvedValue(updated);

      const req = { params: { requestId: "r9" }, body: { status: "APPROVED" } };
      const res = mockRes();

      await updateStatus(req, res);

      expect(scheduleService.updateRequestStatus).toHaveBeenCalledWith("r9", "APPROVED");
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    test("400 -> when service throws", async () => {
      scheduleService.updateRequestStatus.mockRejectedValue(new Error("invalid status"));

      const req = { params: { requestId: "r1" }, body: { status: "NOPE" } };
      const res = mockRes();

      await updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "invalid status" });
    });
  });

  describe("getAllRequests", () => {
    test("200 -> returns all requests", async () => {
      const all = [{ id: "a1" }, { id: "a2" }];
      scheduleService.getAllRequests.mockResolvedValue(all);

      const req = {};
      const res = mockRes();

      await getAllRequests(req, res);

      expect(scheduleService.getAllRequests).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(all);
    });

    test("500 -> when service throws", async () => {
      scheduleService.getAllRequests.mockRejectedValue(new Error("boom"));

      const req = {};
      const res = mockRes();

      await getAllRequests(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: "boom" });
    });
  });
});
