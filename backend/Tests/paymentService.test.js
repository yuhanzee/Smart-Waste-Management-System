const Payment = require("../models/Payment");
const SpecialCollection = require("../models/SpecialCollection");
const paymentService = require("../services/paymentService"); // adjust path if needed

jest.mock("../models/Payment");
jest.mock("../models/SpecialCollection");

describe("Payment Service - processPayment", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should process payment successfully", async () => {
    // input
    const data = {
      user: "u1",
      requestId: "r1",
      method: "Card",
      amount: 1500,
    };

    // collection found
    const mockCollection = { _id: "r1", paymentStatus: "Unpaid", save: jest.fn() };
    SpecialCollection.findById.mockResolvedValue(mockCollection);

    const mockPayment = {
      _id: "p1",
      transactionId: "TGS-123456",
      populate: jest.fn().mockResolvedValue("populatedPayment"),
    };
    Payment.create.mockResolvedValue(mockPayment);

    const result = await paymentService.processPayment(data);

    expect(SpecialCollection.findById).toHaveBeenCalledWith("r1");
    expect(Payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "u1",
        requestId: "r1",
        method: "Card",
        amount: 1500,
        mode: "Card",
        status: "Success",
        description: "Special collection payment",
      })
    );
    expect(mockCollection.paymentStatus).toBe("Paid");
    expect(mockCollection.save).toHaveBeenCalled();
    expect(mockPayment.populate).toHaveBeenCalledWith(["user", "requestId"]);
    expect(result).toBe("populatedPayment");
  });

  test("should throw error if collection not found", async () => {
    SpecialCollection.findById.mockResolvedValue(null);

    await expect(
      paymentService.processPayment({
        user: "u1",
        requestId: "bad-id",
        method: "Card",
        amount: 1000,
      })
    ).rejects.toThrow("Collection request not found.");

    expect(Payment.create).not.toHaveBeenCalled();
  });
});
