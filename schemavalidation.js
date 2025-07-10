const Joi = require('joi');

const listingschema = Joi.object({
    list:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        price:Joi.number().required().min(0),
        location:Joi.string().required(),
        country:Joi.string().required(),
      
       
    }).required()
 
});

const reviewschema=Joi.object({
     review:Joi.object({
      
     rating:Joi.number().required().min(1).max(5),
     comment:Joi.string().required()

     }).required()
})

module.exports={listingschema,reviewschema};

