import { NewsCollection } from "../database/models/news.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";

// Get all news with pagination and sorting
export const getAllNews = async ({
  filters = {},
  pagination = { page: 1, perPage: 10 },
  sort = { createdAt: -1 }, // Default sorting by creation date descending
}) => {
  const { page, perPage } = pagination;
  const offset = (page - 1) * perPage;

  const query = {};

  // Apply filters if provided
  if (filters.topic) {
    query.topic = { $regex: filters.topic, $options: "i" };
  }
  if (filters.typeAccount) {
    query.typeAccount = filters.typeAccount;
  }
  if (filters.userId) {
    query.userId = filters.userId;
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
    throw new Error("Error fetching news: " + error.message);
  }
};

// Create a new news entry
export const createNews = async (newsData) => {
  try {
    const newNews = new NewsCollection(newsData);
    return await newNews.save();
  } catch (error) {
    throw new Error("Error creating news: " + error.message);
  }
};

// Delete a news entry by ID
export const deleteNews = async (newsId) => {
  try {
    return await NewsCollection.findByIdAndDelete(newsId);
  } catch (error) {
    throw new Error("Error deleting news: " + error.message);
  }
};
