import type { ParsedQs } from "qs";

import type { NewsQueryFilters } from "../services/newsService.js";

type NewsQuery = ParsedQs & {
  page?: string | string[];
  perPage?: string | string[];
  sortField?: string | string[];
  sortOrder?: string | string[];
};

const parseString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }
  return typeof value === "string" ? value : undefined;
};

const parseNumber = (value: unknown, fallback: number): number => {
  if (Array.isArray(value)) {
    return parseNumber(value[0], fallback);
  }
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const parseNewsQuery = (query: NewsQuery) => {
  const page = parseNumber(query.page, 1);
  const perPage = parseNumber(query.perPage, 10);

  const sortField = parseString(query.sortField) || "createdAt";
  const sortOrder = parseString(query.sortOrder) === "asc" ? 1 : -1;

  const filters: NewsQueryFilters = {};

  const topic = parseString(query.topic);
  if (topic) filters.topic = topic;

  const typeAccount = parseString(query.typeAccount);
  if (typeAccount) filters.typeAccount = typeAccount as NewsQueryFilters["typeAccount"];

  const userId = parseString(query.userId);
  if (userId) filters.userId = userId;

  const type = parseString(query.type);
  if (type) filters.type = type as NewsQueryFilters["type"];

  return {
    pagination: { page, perPage, sort: { [sortField]: sortOrder as 1 | -1 } },
    filters,
  };
};
