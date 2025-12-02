import * as services from "../services/newsService.js";
import { parsPaginationParams } from "../utils/parsParams.js";

export const getAllNewsController = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await services.getAllNews(filters);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const createNewsController = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await services.createNews(data);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteNewsController = async (req, res, next) => {
  try {
    const newsId = req.params.newsId;
    const result = await services.deleteNews(newsId);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
