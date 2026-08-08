import { query } from "../database/postgres.js";
import type { CreateNewsInput, News } from "../database/models/news.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";

export type NewsQueryFilters = Partial<Pick<News, "topic" | "typeAccount" | "userId" | "type">>;

export type NewsQueryOptions = NewsQueryFilters & {
  page?: number;
  perPage?: number;
  sort?: Record<string, 1 | -1>;
};

const NEWS_SORT_COLUMNS: Record<string, string> = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  topic: "topic",
  type: "type",
  typeAccount: "type_account",
};

const newsSelect = `
  id as "_id",
  user_id as "userId",
  type,
  type_account as "typeAccount",
  topic,
  text,
  files,
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

const getSortClause = (sort: Record<string, 1 | -1>) => {
  const [field = "createdAt", direction = -1] = Object.entries(sort)[0] ?? [];
  const column = NEWS_SORT_COLUMNS[field] ?? NEWS_SORT_COLUMNS.createdAt;
  return `${column} ${direction === 1 ? "asc" : "desc"}`;
};

const buildWhereClause = (filters: NewsQueryFilters) => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.topic) {
    values.push(`%${filters.topic}%`);
    conditions.push(`topic ilike $${values.length}`);
  }
  if (filters.typeAccount) {
    values.push(filters.typeAccount);
    conditions.push(`type_account = $${values.length}`);
  }
  if (filters.userId) {
    values.push(filters.userId);
    conditions.push(`user_id = $${values.length}`);
  }
  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }

  return {
    values,
    where: conditions.length ? `where ${conditions.join(" and ")}` : "",
  };
};

export const getAllNews = async ({
  page = 1,
  perPage = 10,
  sort = { createdAt: -1 },
  ...filters
}: NewsQueryOptions) => {
  const offset = (page - 1) * perPage;

  const { values, where } = buildWhereClause(filters);
  const orderBy = getSortClause(sort);

  try {
    const totalResult = await query<{ count: string }>(
      `select count(*) from news ${where}`,
      values
    );
    const newsResult = await query<News>(
      `
        select ${newsSelect}
        from news
        ${where}
        order by ${orderBy}
        limit $${values.length + 1}
        offset $${values.length + 2}
      `,
      [...values, perPage, offset]
    );
    const totalNews = Number(totalResult.rows[0]?.count ?? 0);

    const paginationInfo = calculatePaginationData(totalNews, page, perPage);

    return {
      ...paginationInfo,
      news: newsResult.rows,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error fetching news: " + message);
  }
};

export const createNews = async (newsData: CreateNewsInput) => {
  try {
    const result = await query<News>(
      `
        insert into news (user_id, type, type_account, topic, text, files)
        values ($1, $2, $3, $4, $5, $6)
        returning ${newsSelect}
      `,
      [
        newsData.userId,
        newsData.type,
        newsData.typeAccount,
        newsData.topic,
        newsData.text,
        newsData.files ?? [],
      ]
    );

    return result.rows[0];
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error creating news: " + message);
  }
};

export const deleteNews = async (newsId: string) => {
  try {
    const result = await query<News>(
      `
        delete from news
        where id = $1
        returning ${newsSelect}
      `,
      [newsId]
    );

    return result.rows[0] ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error deleting news: " + message);
  }
};
