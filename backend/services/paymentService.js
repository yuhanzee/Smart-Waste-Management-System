const Payment = require("../models/Payment");
const SpecialCollection = require("../models/SpecialCollection");

exports.processPayment = async (data) => {
  const { user, requestId, method, amount } = data;

  const collection = await SpecialCollection.findById(requestId);
  if (!collection) throw new Error("Collection request not found.");

  const transactionId = "TGS-" + Date.now() + "-" + Math.floor(Math.random() * 10000);

  const payment = await Payment.create({
    user,
    requestId,
    method,
    amount,
    mode: "Card",
    status: "Success",
    transactionId,
    description: "Special collection payment",
  });

  collection.paymentStatus = "Paid";
  await collection.save();

  return await payment.populate(["user", "requestId"]);
};

