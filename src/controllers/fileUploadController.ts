import { RequestHandler } from "express";

import * as services from "../services/fileUploadService.js";

export const createFileUploadSignedUrlController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const result = await services.createFileUploadSignedUrl(req.body);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
