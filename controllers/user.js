const User=require("../models/user.js");
const passport=require("passport");

module.exports.rendersignup=(req,res)=>{

    res.render("user/signup");
}

module.exports.createuser=async (req,res)=>{
   
    try{
       let {username,email,password}=req.body;
       const newuser=new User({username,email});
       const registereduser=await User.register(newuser,password);
       req.login(registereduser,(err)=>{
         if(err){
            return next(err);
         }
       req.flash("success","welcome to Havenza");
       return res.redirect("/api/list");
       });
      
    }catch(err){
        req.flash("error",err.message);
        return res.redirect("/api/user/signup");
    }

}



module.exports.login=async (req,res)=>{
    
         req.flash("success","welcome back to havenza");
         if(res.locals.redirectUrl){
               return res.redirect(res.locals.redirectUrl);}
         else{
         return res.redirect("/api/list");
      }

        
         

}

module.exports.renderloginform=(req,res)=>{

   return res.render("user/login")
    
};

module.exports.logout=(req,res,next)=>{

      req.logOut((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are logged out");
        return res.redirect("/api/list");
      })


}