import { Joi, Segments } from 'celebrate';

export const getNewsSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1),
    perPage: Joi.number().integer().min(1).max(100),
    sortField: Joi.string().valid(
      'createdAt',
      'updatedAt',
      'topic',
      'type',
      'typeAccount',
    ),
    sortOrder: Joi.string().valid('asc', 'desc'),
    topic: Joi.string().trim(),
    type: Joi.string().valid(
      'updates',
      'news',
      'testimonials',
      'video stories',
    ),
    typeAccount: Joi.string().valid('freeUser', 'paidUser', 'agencyUser'),
    userId: Joi.string().trim(),
  }),
};

export const createNewsSchema = {
  [Segments.BODY]: Joi.object({
    userId: Joi.string().trim().required(),
    type: Joi.string()
      .valid('updates', 'news', 'testimonials', 'video stories')
      .required(),
    typeAccount: Joi.string()
      .valid('freeUser', 'paidUser', 'agencyUser')
      .required(),
    topic: Joi.string().trim().required(),
    text: Joi.string().trim().required(),
    files: Joi.array().items(Joi.string().trim()).default([]),
  }),
};

export const deleteNewsSchema = {
  [Segments.PARAMS]: Joi.object({
    newsId: Joi.string().uuid().required(),
  }),
};
