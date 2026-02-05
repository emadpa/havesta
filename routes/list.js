const express = require("express");
const wrapAsync = require("../utils/wrapasync.js");
const listscontroller = require("../controllers/lists.js");
const { isloggedin, validatelist, isowner } = require("../middleware.js");
const router = express.Router({ mergeParams: true });
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listscontroller.index))
  .post(
    isloggedin,
    validatelist,
    upload.single("list[image]"),
    wrapAsync(listscontroller.createlist),
  );

router.get("/new", isloggedin, wrapAsync(listscontroller.renderformfornewlist));

router
  .route("/:id")
  .get(wrapAsync(listscontroller.showlist))
  .put(
    isloggedin,
    isowner,
    validatelist,
    upload.single("list[image]"),
    wrapAsync(listscontroller.updatelist),
  )
  .delete(isloggedin, isowner, wrapAsync(listscontroller.deletelist));

router.get(
  "/:id/edit",
  isloggedin,
  isowner,
  wrapAsync(listscontroller.renderformforedit),
);

module.exports = router;
