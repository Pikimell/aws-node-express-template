import { celebrate, Joi, Segments } from "celebrate";

const email = Joi.string().trim().email().required();
const password = Joi.string()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least 8 characters, uppercase, lowercase, number and symbol",
  });
const code = Joi.string().trim().required();

export const validateRegister = celebrate({
  [Segments.BODY]: Joi.object({
    email,
    password,
  }).required(),
});

export const validateLogin = celebrate({
  [Segments.BODY]: Joi.object({
    email,
    password: Joi.string().required(),
  }).required(),
});

export const validateLogout = celebrate({
  [Segments.BODY]: Joi.object({}),
});

export const validateRefresh = celebrate({
  [Segments.BODY]: Joi.object({
    refreshToken: Joi.string().trim(),
  }),
});

export const validateResetRequest = celebrate({
  [Segments.BODY]: Joi.object({
    email,
  }).required(),
});

export const validateResetConfirm = celebrate({
  [Segments.BODY]: Joi.object({
    email,
    code,
    newPassword: password,
  }).required(),
});

export const validateConfirmEmail = celebrate({
  [Segments.BODY]: Joi.object({
    email,
    code,
  }).required(),
});
