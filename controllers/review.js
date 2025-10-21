const Review = require("../models/review");
const List = require("../models/lists");

module.exports.createreview = async (req, res) => {
  let { id } = req.params;

  let review = await Review.create({
    ...req.body.review,
    author: req.user._id,
  });

  await List.findByIdAndUpdate(id, {
    $push: { reviews: review._id }, // Push the review ID into reviews array
  });

  req.flash("success", "New review Created");
  return res.redirect(`/api/list/${id}`);
};

module.exports.deletereview = async (req, res) => {
  let { id, reviewid } = req.params;
  await List.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
  await Review.findByIdAndDelete(reviewid);
  req.flash("success", "review deleted");
  return res.redirect(`/api/list/${id}`);
};
