const Booking = require("../models/booking.js");
const List = require("../models/lists.js");
const razorpay = require("../paymentconfig.js");
const mongoose = require("mongoose");
const crypto = require("crypto");

module.exports.getmybookings = async (req, res) => {
  const today = new Date();
  const bookings = await Booking.find({
    user: req.user._id,
    endDate: { $gte: today },
  })
    .populate("property")
    .populate("user");
  console.log("booking");
  return res.render("Booking/userbooking", { bookings });
};

module.exports.getbookingpage = async (req, res) => {
  const { id } = req.params;
  const list = await List.findById(id);
  return res.render("Booking/Booking", { list });
};

module.exports.getownerbookings = async (req, res) => {
  const properties = await List.find({ owner: req.user._id });

  if (properties.length === 0) {
    return res.render("Booking/ownerbooking", {
      properties: [],
      bookings: [],
    });
  }

  const propertyIds = properties.map((p) => p._id);
  const bookings = await Booking.find({ property: { $in: propertyIds } })
    .populate("property")
    .populate("user");

  return res.render("Booking/ownerbooking", { properties, bookings });
};

module.exports.createbooking = async (req, res) => {
  let session;
  try {
    const { id } = req.params;
    const { startDate, endDate, paymentId, orderId, signature } = req.body;

    if (!startDate || !endDate || !paymentId || !orderId || !signature) {
      return res.status(400).json({ success: false });
    }

    // 🔐 Verify signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment" });
    }

    // 🔐 Confirm payment with Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    if (payment.status !== "captured") {
      return res.status(400).json({ success: false });
    }

    // optional safety check
    if (payment.notes?.listingId !== id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Payment-listing mismatch",
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();
    // 2️⃣ Overlapping booking check
    const overlapping = await Booking.findOne({
      property: id,
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) },
    }).session(session);

    if (overlapping) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: "Property already booked for selected dates",
      });
    }

    // 3️⃣ Create booking
    const booking = await Booking.create(
      [
        {
          property: id,
          user: req.user._id,
          startDate,
          endDate,
          paymentId,
          orderId,
        },
      ],
      { session },
    );

    // 4️⃣ Attach booking to property
    await List.findByIdAndUpdate(
      id,
      { $push: { bookings: booking[0]._id } },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Booking successful",
      booking,
    });
  } catch (err) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    session.endSession();
    res.status(500).json({ success: false, message: "Server error" });
  }
};
