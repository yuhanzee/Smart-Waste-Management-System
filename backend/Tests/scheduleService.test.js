const scheduleService = require("../services/scheduleService");
const Slot = require("../models/Slot");
const Truck = require("../models/Truck");
const SpecialCollection = require("../models/SpecialCollection");

jest.mock("../models/Slot");
jest.mock("../models/Truck");
jest.mock("../models/SpecialCollection");

describe("Schedule Service", () => {
  beforeEach(() => jest.clearAllMocks());

  // createPickupRequest()
  describe("createPickupRequest", () => {
    test("should block user with unpaid request", async () => {
      const mockUnpaid = { _id: "req123" };
      SpecialCollection.findOne.mockResolvedValue(mockUnpaid);

      const result = await scheduleService.createPickupRequest({ user: "u1" });

      expect(SpecialCollection.findOne).toHaveBeenCalledWith({
        user: "u1",
        paymentStatus: "Unpaid",
        requestStatus: { $ne: "Cancelled" },
      });
      expect(result.blocked).toBe(true);
      expect(result.unpaidRequestId).toBe("req123");
    });

    test("should block invalid slot", async () => {
      SpecialCollection.findOne.mockResolvedValue(null);
      Slot.findById.mockResolvedValue(null);

      const result = await scheduleService.createPickupRequest({
        user: "u1",
        slotId: "invalid",
      });

      expect(Slot.findById).toHaveBeenCalledWith("invalid");
      expect(result.blocked).toBe(true);
      expect(result.message).toBe("Invalid slot selected.");
    });

    test("should create new request successfully", async () => {
      SpecialCollection.findOne.mockResolvedValue(null);

      const mockSlot = { _id: "slot1", isAvailable: true, save: jest.fn() };
      Slot.findById.mockResolvedValue(mockSlot);

      const mockPopulated = { id: "req1", slot: mockSlot };
      const mockRequest = { populate: jest.fn().mockResolvedValue(mockPopulated) };
      SpecialCollection.create.mockResolvedValue(mockRequest);

      const data = {
        user: "u1",
        name: "Test",
        slotId: "slot1",
        fee: 200,
      };

      const result = await scheduleService.createPickupRequest(data);

      expect(mockSlot.save).toHaveBeenCalled();
      expect(SpecialCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "u1",
          slot: "slot1",
          paymentStatus: "Unpaid",
          requestStatus: "Scheduled",
        })
      );
      expect(result).toBe(mockPopulated);
    });
  });

  // getUserRequests()
  describe("getUserRequests", () => {
    test("should return requests sorted by date", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([{ id: 1 }]),
      };
      SpecialCollection.find.mockReturnValue(mockQuery);

      const res = await scheduleService.getUserRequests("u1");

      expect(SpecialCollection.find).toHaveBeenCalledWith({ user: "u1" });
      expect(mockQuery.populate).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res).toEqual([{ id: 1 }]);
    });
  });

  // updateRequestStatus()
  describe("updateRequestStatus", () => {
    test("should update request status successfully", async () => {
      const mockReq = { requestStatus: "Pending", save: jest.fn() };
      SpecialCollection.findById.mockResolvedValue(mockReq);

      const res = await scheduleService.updateRequestStatus("r1", "Completed");

      expect(mockReq.requestStatus).toBe("Completed");
      expect(mockReq.save).toHaveBeenCalled();
      expect(res).toBe(mockReq);
    });
  });

  // getAllRequests()
  describe("getAllRequests", () => {
    test("should return all populated requests", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([{ id: "req1" }]),
      };
      SpecialCollection.find.mockReturnValue(mockQuery);

      const res = await scheduleService.getAllRequests();

      expect(SpecialCollection.find).toHaveBeenCalled();
      expect(mockQuery.populate).toHaveBeenCalledTimes(2);
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res).toEqual([{ id: "req1" }]);
    });

    test("should throw custom error on DB failure", async () => {
      SpecialCollection.find.mockImplementation(() => {
        throw new Error("Connection failed");
      });

      await expect(scheduleService.getAllRequests()).rejects.toThrow(
        "Failed to fetch special collection requests: Connection failed"
      );
    });
  });
});
