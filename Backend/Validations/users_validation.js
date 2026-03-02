import Joi from "joi";
const userSchema = Joi.object({
    name: Joi.string().min(2).max(80).required(),
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(18).max(100).required(),
    mobile_Number: Joi.string().min(10).max(12).required(),
    password: Joi.string().min(6).max(20).required()
})

export default userSchema;