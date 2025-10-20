const List = require("../models/lists");
const mbxgeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
require("dotenv").config();
const geocodingClient = mbxgeocoding({
  accessToken: process.env.MAP_ACCESS_TOKEN,
});

module.exports.index = async (req, res) => {
  const { country } = req.query;
  let listings = [];

  if (country && country.trim() !== "") {
    // Case-insensitive search for country
    listings = await List.find({
      country: { $regex: country.trim(), $options: "i" },
    });
  } else {
    // No country filter — show all listings
    listings = await List.find({});
  }
  res.render("listings/lists", { listings, q:country });
};

module.exports.renderformfornewlist = async (req, res) => {
  return res.render("listings/new");
};

module.exports.showlist = async (req, res) => {
  let { id } = req.params;
  const list = await List.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!list) {
    req.flash("error", "List you requested did not exist");
    return res.redirect("/api/list");
  }
  return res.render("listings/show", { list });
};

module.exports.renderformforedit = async (req, res) => {
  let { id } = req.params;
  const list = await List.findById(id);

  if (!list) {
    req.flash("error", "List you requested did not exist");
    return res.redirect("/api/list");
  }
  const imageurl = list.image.url.replace("/upload", "/upload/h_300,w_250");

  return res.render("listings/edit", { list, imageurl });
};

module.exports.createlist = async (req, res, next) => {
  const response = await geocodingClient
    .forwardGeocode({
      query: req.body.list.location,
      limit: 1,
    })
    .send();

  const list = await List.create({
    ...req.body.list,
    location: req.body.list.location.toLowerCase(),
    country: req.body.list.country.toLowerCase(),
    owner: req.user._id,
    image: { url: req.file.path, filename: req.file.filename },
    geometry: response.body.features[0].geometry,
  });

  await list.save();
  req.flash("success", "New List Created");
  return res.redirect("/api/list");
};

module.exports.updatelist = async (req, res) => {
  let { id } = req.params;
  const list = await List.findByIdAndUpdate(id, req.body.list, {
    new: true,
    runValidators: true,
  });

  if (req.file) {
    list.image.url = req.file.path;
    list.image.filename = req.file.filename;
    await list.save();
  }

  req.flash("success", "List updated");
  return res.redirect(`/api/list/${id}`);
};

module.exports.deletelist = async (req, res) => {
  let { id } = req.params;
  const list = await List.findByIdAndDelete(id);
  req.flash("success", "List is delected successfully");
  return res.redirect("/api/list");
};
