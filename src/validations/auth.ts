import { Joi, Segments } from "celebrate";

export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().min(6).required(),
    nickname: Joi.string().trim(),
    role: Joi.string().valid("user", "admin"),
  }),
};

export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().required(),
  }),
};
