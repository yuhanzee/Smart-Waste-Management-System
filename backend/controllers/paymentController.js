const paymentService = require("../services/paymentService");

exports.makePayment = async (req, res) => {
  try {
    const payment = await paymentService.processPayment(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
