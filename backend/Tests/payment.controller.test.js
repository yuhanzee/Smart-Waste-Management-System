/**
 * backend/Tests/payment.controller.test.js
 * Unit tests for makePayment controller with a mocked paymentService.
 */

jest.mock("../services/paymentService", () => ({
  processPayment: jest.fn(),
}));

const paymentService = require("../services/paymentService");

// ⬇️ adjust this path if your controller file name/path is different
const { makePayment } = require("../controllers/paymentController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json  = jest.fn().mockReturnValue(res);
  return res;
};

describe("makePayment controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("201 -> returns payment when service resolves", async () => {
    const body = { amount: 2500, currency: "LKR", source: "tok_visa" };
    const paymentResult = { id: "pay_123", status: "succeeded", amount: 2500 };

    paymentService.processPayment.mockResolvedValue(paymentResult);

    const req = { body };
    const res = mockRes();

    await makePayment(req, res);

    // service called with the same body
    expect(paymentService.processPayment).toHaveBeenCalledTimes(1);
    expect(paymentService.processPayment).toHaveBeenCalledWith(body);

    // response
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(paymentResult);
  });

  test("400 -> returns msg when service rejects with Error", async () => {
    const body = { amount: 2500, currency: "LKR", source: "tok_chargeDeclined" };
    const err = new Error("card declined");

    paymentService.processPayment.mockRejectedValue(err);

    const req = { body };
    const res = mockRes();

    await makePayment(req, res);

    expect(paymentService.processPayment).toHaveBeenCalledWith(body);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "card declined" });
  });

  test("400 -> returns msg when service rejects with non-Error value", async () => {
    const body = { amount: 1000, currency: "LKR" };
    // some libraries reject with a string/object; your controller uses err.message
    // so make sure the test covers a case where message is undefined
    paymentService.processPayment.mockRejectedValue("RATE_LIMIT");

    const req = { body };
    const res = mockRes();

    await makePayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    // err.message is undefined, so msg becomes undefined – this asserts current behavior.
    // If you want a safer fallback, update the controller to: err.message || String(err)
    expect(res.json).toHaveBeenCalledWith({ msg: undefined });
  });
});
