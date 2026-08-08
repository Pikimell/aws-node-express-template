import { celebrate, Joi, Segments } from "celebrate";

const newsTypes = ["updates", "news", "testimonials", "video stories"];
const accountTypes = ["freeUser", "paidUser", "agencyUser"];
const sortFields = ["createdAt", "topic", "type", "typeAccount"];
const sortOrders = ["asc", "desc"];

export const validateCreateNews = celebrate({
  [Segments.BODY]: Joi.object({
    userId: Joi.string().trim().required(),
    type: Joi.string()
      .valid(...newsTypes)
      .required(),
    typeAccount: Joi.string()
      .valid(...accountTypes)
      .required(),
    topic: Joi.string().trim().required(),
    text: Joi.string().trim().required(),
    files: Joi.array().items(Joi.string().trim()).default([]),
  }).required(),
});

export const validateGetAllNews = celebrate({
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().positive(),
    perPage: Joi.number().integer().positive().max(100),
    sortField: Joi.string().valid(...sortFields),
    sortOrder: Joi.string().valid(...sortOrders),
    topic: Joi.string().trim(),
    typeAccount: Joi.string().valid(...accountTypes),
    userId: Joi.string().trim(),
    type: Joi.string().valid(...newsTypes),
  }),
});

export const validateDeleteNews = celebrate({
  [Segments.PARAMS]: Joi.object({
    newsId: Joi.string().hex().length(24).required(),
  }).required(),
});
