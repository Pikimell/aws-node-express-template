import { RequestHandler } from "express";

import * as services from "../services/newsService.js";
import { parseNewsQuery } from "../utils/parseNewsQuery.js";

export const getAllNewsController: RequestHandler = async (req, res, next) => {
  try {
    const { pagination, filters } = parseNewsQuery(req.query);
    const result = await services.getAllNews({
      ...pagination,
      ...filters,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const createNewsController: RequestHandler = async (req, res, next) => {
  try {
    const result = await services.createNews(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteNewsController: RequestHandler = async (req, res, next) => {
  try {
    const newsId = req.params.newsId;
    const result = await services.deleteNews(newsId);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
