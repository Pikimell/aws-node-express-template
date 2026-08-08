import { supabase } from "../database/supabase.js";
import type { CreateNewsInput, News } from "../database/models/news.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";

export type NewsQueryFilters = Partial<Pick<News, "topic" | "typeAccount" | "userId" | "type">>;

export type NewsQueryOptions = NewsQueryFilters & {
  page?: number;
  perPage?: number;
  sort?: Record<string, 1 | -1>;
};

type NewsRow = {
  id: string;
  user_id: string;
  type: News["type"];
  type_account: News["typeAccount"];
  topic: string;
  text: string;
  files: string[];
  created_at: string;
  updated_at: string;
};

const NEWS_SORT_COLUMNS: Record<string, keyof NewsRow> = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  topic: "topic",
  type: "type",
  typeAccount: "type_account",
};

const newsSelect =
  "id,user_id,type,type_account,topic,text,files,created_at,updated_at";

const mapNews = (row: NewsRow): News => ({
  _id: row.id,
  userId: row.user_id,
  type: row.type,
  typeAccount: row.type_account,
  topic: row.topic,
  text: row.text,
  files: row.files,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const getSort = (sort: Record<string, 1 | -1>) => {
  const [field = "createdAt", direction = -1] = Object.entries(sort)[0] ?? [];
  return {
    column: NEWS_SORT_COLUMNS[field] ?? NEWS_SORT_COLUMNS.createdAt,
    ascending: direction === 1,
  };
};

export const getAllNews = async ({
  page = 1,
  perPage = 10,
  sort = { createdAt: -1 },
  ...filters
}: NewsQueryOptions) => {
  const offset = (page - 1) * perPage;
  const { column, ascending } = getSort(sort);

  try {
    let request = supabase
      .from("news")
      .select(newsSelect, { count: "exact" })
      .order(column, { ascending })
      .range(offset, offset + perPage - 1);

    if (filters.topic) request = request.ilike("topic", `%${filters.topic}%`);
    if (filters.typeAccount) request = request.eq("type_account", filters.typeAccount);
    if (filters.userId) request = request.eq("user_id", filters.userId);
    if (filters.type) request = request.eq("type", filters.type);

    const { data, count, error } = await request.returns<NewsRow[]>();

    if (error) throw error;

    const paginationInfo = calculatePaginationData(count ?? 0, page, perPage);

    return {
      ...paginationInfo,
      news: (data ?? []).map(mapNews),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error fetching news: " + message);
  }
};

export const createNews = async (newsData: CreateNewsInput) => {
  try {
    const { data, error } = await supabase
      .from("news")
      .insert({
        user_id: newsData.userId,
        type: newsData.type,
        type_account: newsData.typeAccount,
        topic: newsData.topic,
        text: newsData.text,
        files: newsData.files ?? [],
      })
      .select(newsSelect)
      .single<NewsRow>();

    if (error) throw error;
    return mapNews(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error creating news: " + message);
  }
};

export const deleteNews = async (newsId: string) => {
  try {
    const { data, error } = await supabase
      .from("news")
      .delete()
      .eq("id", newsId)
      .select(newsSelect)
      .maybeSingle<NewsRow>();

    if (error) throw error;
    return data ? mapNews(data) : null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error deleting news: " + message);
  }
};
