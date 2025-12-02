import type { FilterQuery } from "mongoose";

import { NewsCollection, type News } from "../database/models/news.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";

export type NewsQueryFilters = Partial<Pick<News, "topic" | "typeAccount" | "userId" | "type">>;

export type NewsQueryOptions = NewsQueryFilters & {
  page?: number;
  perPage?: number;
  sort?: Record<string, 1 | -1>;
};

export const getAllNews = async ({
  page = 1,
  perPage = 10,
  sort = { createdAt: -1 },
  ...filters
}: NewsQueryOptions) => {
  const offset = (page - 1) * perPage;

  const query: FilterQuery<News> = {};

  if (filters.topic) {
    query.topic = { $regex: filters.topic, $options: "i" };
  }
  if (filters.typeAccount) {
    query.typeAccount = filters.typeAccount;
  }
  if (filters.userId) {
    query.userId = filters.userId;
  }
  if (filters.type) {
    query.type = filters.type;
  }

  try {
    const totalNews = await NewsCollection.countDocuments(query);
    const newsList = await NewsCollection.find(query)
      .sort(sort)
      .skip(offset)
      .limit(perPage);

    const paginationInfo = calculatePaginationData(totalNews, page, perPage);

    return {
      ...paginationInfo,
      news: newsList,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error fetching news: " + message);
  }
};

export const createNews = async (newsData: News) => {
  try {
    return await NewsCollection.create(newsData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error creating news: " + message);
  }
};

export const deleteNews = async (newsId: string) => {
  try {
    return await NewsCollection.findByIdAndDelete(newsId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error deleting news: " + message);
  }
};
