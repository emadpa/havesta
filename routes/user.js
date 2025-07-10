const express=require("express");
const wrapAsync = require("../utils/wrapasync");
const {saveredirecturl}=require("../middleware.js");
const passport=require("passport");
const { rendersignup, createuser, renderloginform, logout ,login} = require("../controllers/user.js");
const router=express.Router();


router.route("/signup")
       .get(rendersignup)
       .post(createuser);

router.route("/login")
       .get(renderloginform)
       .post(saveredirecturl, passport.authenticate("local",{failureRedirect:"/api/user/login",failureFlash:true}),login);

router.get("/logout",logout);


module.exports=router;