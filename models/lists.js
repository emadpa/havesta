const mongoose = require("mongoose");
const Review = require("./review.js");

const listschema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      url: String,
      filename: String,
    },
    price: Number,
    location: String,
    country: String,
    bookings: [
   {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
],

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    geometry: {
      type: {
        type: String, // Must be 'Point'
        enum: ["Point"], // GeoJSON requires this
        required: true,
      },
      coordinates: {
        type: [Number],
        default: [77.209, 28.6139], // [longitude, latitude]
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);



const List = mongoose.model("List", listschema);

listschema.post("findByIdAndDelete", async (list) => {
  if (list) {
    await Review.deleteMany({ _id: { $in: list.reviews } });
  }
});

module.exports = List;
