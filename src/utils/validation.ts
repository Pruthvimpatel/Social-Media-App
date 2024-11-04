import Joi from "joi";

export const registerSchema = Joi.object({
  userName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  profileImage: Joi.string().optional().uri(),
  profileVisibility: Joi.string().valid('PRIVATE', 'FRIENDS_ONLY', 'PUBLIC').optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
})
