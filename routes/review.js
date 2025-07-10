const express=require("express");
const wrapAsync=require("../utils/wrapasync.js");
const {reviewschema}=require("../schemavalidation.js");
const List=require("../models/lists");
const Review=require("../models/review");
const ExpressError=require("../utils/customerror.js");
const {isloggedin,isreviewauthor}=require("../middleware.js");
const { createreview, deletereview } = require("../controllers/review.js");
const router=express.Router({ mergeParams: true });


const validatereview=(req,res,next)=>{

      let result=reviewschema.validate(req.body, { abortEarly: false });
    if(result.error){
        throw new ExpressError(400,result.error.details.map(el => el.message).join(", "));
    }
    next();
}


router.post("/",isloggedin,validatereview,wrapAsync(createreview));


router.delete("/:reviewid",isloggedin,isreviewauthor,wrapAsync(deletereview));


module.exports=router;
