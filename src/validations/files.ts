import { Joi, Segments } from 'celebrate';

const fileIdSchema = {
  [Segments.PARAMS]: Joi.object({
    fileId: Joi.string().hex().length(24).required(),
  }),
};

export const getFilesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1),
    perPage: Joi.number().integer().min(1).max(100),
    sortField: Joi.string().valid('createdAt', 'updatedAt', 'name', 'url'),
    sortOrder: Joi.string().valid('asc', 'desc'),
    name: Joi.string().trim(),
    url: Joi.string().trim(),
    userId: Joi.string().trim(),
  }),
};

export const getFileByIdSchema = fileIdSchema;

export const createFileSchema = {
  [Segments.BODY]: Joi.object({
    userId: Joi.string().trim().required(),
    name: Joi.string().trim().required(),
    url: Joi.string().trim().uri().required(),
  }),
};

export const createFileUploadSignedUrlSchema = {
  [Segments.BODY]: Joi.object({
    fileName: Joi.string().trim().required(),
    contentType: Joi.string().trim(),
  }),
};

export const updateFileSchema = {
  ...fileIdSchema,
  [Segments.BODY]: Joi.object({
    userId: Joi.string().trim(),
    name: Joi.string().trim(),
    url: Joi.string().trim().uri(),
  }).min(1),
};

export const deleteFileSchema = fileIdSchema;
