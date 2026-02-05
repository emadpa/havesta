const express = require("express");
const router = express.Router();
const razorpay = require("../paymentconfig.js");
const List = require("../models/lists.js");
const crypto = require("crypto");

router.post("/create-order", async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body; // amount in rupees
    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ success: false });
    }
    const listing = await List.findById(listingId);
    if (!listing) return res.status(404).json({ success: false });

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ success: false });
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const amount = listing.price * nights;
    const options = {
      amount: amount * 100, // Razorpay expects paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        listingId,
        startDate,
        endDate,
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ success: false, message: "Payment failed" });
  }
});

module.exports = router;
