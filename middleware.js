const List=require("./models/lists");
const Review=require("./models/review");
const {listingschema}=require("./schemavalidation.js");

const isloggedin=(req,res,next)=>{
     if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must login ");
        return res.redirect("/api/user/login");
    }
    next();

}
const saveredirecturl=(req,res,next)=>{
    if( req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();

}

const validatelist=(req,res,next)=>{

      let result=listingschema.validate(req.body, { abortEarly: false });
    if(result.error){
        throw new ExpressError(400,result.error.details.map(el => el.message).join(", "));
    }
    next();
}

const isowner=async (req,res,next)=>{
  
     const {id}=req.params;
     const list=await List.findById(id);

     if(list.owner.toString() !=req.user._id){
             
         req.flash("error","you are not the owner of property");
         return res.redirect(`/api/list/${id}`);
     }

     next();

}

const isreviewauthor=async (req,res,next)=>{
  
     const {id,reviewid}=req.params;
     const review=await Review.findById(reviewid);

     if(review.author.toString() != req.user._id){
             
         req.flash("error","you are not the author of this review");
         return res.redirect(`/api/list/${id}`);
     }

     next();

}

module.exports={isloggedin,saveredirecturl,validatelist,isowner,isreviewauthor};