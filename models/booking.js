// models/booking.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  property: {
    type: Schema.Types.ObjectId,
    ref: "List",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
