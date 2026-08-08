import { RequestHandler } from "express";

import * as services from "../services/fileService.js";
import { parseFilesQuery } from "../utils/parseFilesQuery.js";

export const getAllFilesController: RequestHandler = async (req, res, next) => {
  try {
    const { pagination, filters } = parseFilesQuery(req.query);
    const result = await services.getAllFiles({
      ...pagination,
      ...filters,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getFileByIdController: RequestHandler = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const result = await services.getFileById(fileId);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const createFileController: RequestHandler = async (req, res, next) => {
  try {
    const result = await services.createFile(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateFileController: RequestHandler = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const result = await services.updateFile(fileId, req.body);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteFileController: RequestHandler = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const result = await services.deleteFile(fileId);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
