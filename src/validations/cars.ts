import { Joi, Segments } from 'celebrate';

const carIdParamSchema = {
  [Segments.PARAMS]: Joi.object({
    carId: Joi.string().uuid().required(),
  }),
};

const carBodySchema = {
  userId: Joi.string().trim().required(),
  make: Joi.string().trim().required(),
  model: Joi.string().trim().required(),
  year: Joi.number().integer().min(1886).required(),
  color: Joi.string().trim(),
  price: Joi.number().min(0),
  mileage: Joi.number().min(0),
  vin: Joi.string().trim(),
  images: Joi.array().items(Joi.string().trim()).default([]),
};

export const getCarsSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1),
    perPage: Joi.number().integer().min(1).max(100),
    sortField: Joi.string().valid(
      'createdAt',
      'updatedAt',
      'make',
      'model',
      'year',
      'price',
      'mileage',
    ),
    sortOrder: Joi.string().valid('asc', 'desc'),
    userId: Joi.string().trim(),
    make: Joi.string().trim(),
    model: Joi.string().trim(),
    year: Joi.number().integer().min(1886),
    color: Joi.string().trim(),
    vin: Joi.string().trim(),
  }),
};

export const getCarByIdSchema = carIdParamSchema;

export const getCarsAggregationSchema = {
  [Segments.QUERY]: Joi.object({
    userId: Joi.string().trim(),
    make: Joi.string().trim(),
  }),
};

export const createCarSchema = {
  [Segments.BODY]: Joi.object(carBodySchema),
};

export const updateCarSchema = {
  ...carIdParamSchema,
  [Segments.BODY]: Joi.object({
    ...carBodySchema,
    userId: carBodySchema.userId.optional(),
    make: carBodySchema.make.optional(),
    model: carBodySchema.model.optional(),
    year: carBodySchema.year.optional(),
  }).min(1),
};

export const deleteCarSchema = carIdParamSchema;
