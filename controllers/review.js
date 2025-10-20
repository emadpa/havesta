const Review=require("../models/review");
const List=require("../models/lists");

module.exports.createreview=async (req,res)=>{

       let  {id}=req.params;
     
       let review=await Review.create({...req.body.review,author:req.user._id});
       let list=await List.findById(id);
       list.reviews.push(review);
       await list.save();
        req.flash("success","New review Created");
      return res.redirect(`/api/list/${list._id}`);
           

}

module.exports.deletereview=async (req,res)=>{

   let {id,reviewid}=req.params;
   await List.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
   await  Review.findByIdAndDelete(reviewid);
    req.flash("success","review deleted");
   return res.redirect(`/api/list/${id}`);


}