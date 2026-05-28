const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const authMiddleware = require("../middleware/authMiddleware");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order — ₹1 = 100 paise
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 100, // 100 paise = ₹1
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ message: "Payment error.", error: err.message });
  }
});

// Verify payment
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .toString("hex");

    if (expectedSign === razorpay_signature) {
      res.json({ success: true, message: "Payment verified!" });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed." });
    }
  } catch (err) {
    res.status(500).json({ message: "Verification error.", error: err.message });
  }
});

module.exports = router;
