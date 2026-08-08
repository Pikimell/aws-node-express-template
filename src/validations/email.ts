import { Joi, Segments } from "celebrate";

const emailSchema = Joi.string().email().trim().lowercase().required();

export const notificationEmailSchema = {
  [Segments.BODY]: Joi.object({
    email: emailSchema,
    message: Joi.string().trim().min(1).max(5000).required(),
  }),
};

export const recipientEmailSchema = {
  [Segments.BODY]: Joi.object({
    email: emailSchema,
  }),
};
