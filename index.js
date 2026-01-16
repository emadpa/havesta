const express = require("express");
const app = express();
const mongoose = require("mongoose");
const List = require("./models/lists.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const listroute = require("./routes/list.js");
const reviewroute = require("./routes/review.js");
const bookingroute = require("./routes/book.js");
const userroute = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

app.set("view engine", "ejs");
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("__method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "/public")));

main()
  .then((res) => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(process.env.ATLAS_URL);
}

const store = MongoStore.create({
  mongoUrl: process.env.ATLAS_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

const sessionoptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionoptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.authenticated = req.isAuthenticated();
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.curuser = req.user;
  next();
});

app.use("/api/list", listroute);
app.use("/api/list/:id/review/", reviewroute);
app.use("/api/user", userroute);
app.use("/api/list/book", bookingroute);

app.get("/", async (req, res) => {
  let listings = await List.find({});
  res.render("listings/lists", { listings });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err); // Avoid double responses
  }
  let { status = 500, message = "Something went wrong" } = err;

  return res.render("error/error.ejs", { message });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  //server started
  console.log("server started");
});
