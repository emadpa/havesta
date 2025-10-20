const Booking=require("../models/booking.js");
const List=require("../models/lists.js");

module.exports.getmybookings= async (req, res) => {

    const bookings = await Booking.find({ user: req.user._id })
      .populate("property")
      .populate("user");

   return  res.render("Booking/userbooking", { bookings });
 
}



module.exports.getownerbookings=async (req, res) => {

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
 
}



module.exports.createbooking=async (req, res) => {
    const { id } = req.params;
  const { startDate, endDate } = req.body;

  const overlapping = await Booking.find({
    property: id,
    $or: [
      { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
      { endDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
      {
        startDate: { $lte: new Date(startDate) },
        endDate: { $gte: new Date(endDate) },
      },
    ],
  });

  if (overlapping .length > 0) {
    req.flash("error", "Property already booked for these dates.");
    return res.redirect(`/api/list/${id}`);
  }
  const booking = new Booking({
    property: id,
    user: req.user._id,
    startDate,
    endDate,
  });

  await booking.save();
  await List.findByIdAndUpdate(id, { $push: { bookings: booking._id } });
  

  req.flash("success", "Booking successful!");
  return res.redirect(`/api/list/${id}`);
}


 module.exports.getbookingpage=async (req, res) => {
  const { id } = req.params;
  const list = await List.findById(id).populate("owner");
  if (!list) {
    req.flash("error", "List you requested did not exist");
    return res.redirect("/api/list");
  }

  return res.render("Booking/Booking.ejs", { list });
}