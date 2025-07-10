const mongoose=require("mongoose");


const reviewschema=new mongoose.Schema({

    comment:String,
    rating:{
        type:Number,
        min:1,
        max:5
    },
    author:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"User",
    }
},
    {
        timestamps:true
    }
);

const Review=mongoose.model("Review",reviewschema);

module.exports=Review;
