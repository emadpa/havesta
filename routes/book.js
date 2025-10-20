const express = require("express");
const wrapAsync = require("../utils/wrapasync.js");
const bookingcontroller = require("../controllers/booking.js");
const router = express.Router();
const {isloggedin}=require("../middleware.js");




router.get("/my-bookings", isloggedin, wrapAsync(bookingcontroller.getmybookings));




router.get("/owner", isloggedin, wrapAsync(bookingcontroller.getownerbookings));





router.route("/:id")
          .get(isloggedin,wrapAsync(bookingcontroller.getbookingpage))
          .post( isloggedin,wrapAsync(bookingcontroller.createbooking));








module.exports = router;
