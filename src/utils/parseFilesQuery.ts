import type { ParsedQs } from "qs";

import type { FileQueryFilters } from "../services/fileService.js";

type FilesQuery = ParsedQs & {
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

export const parseFilesQuery = (query: FilesQuery) => {
  const page = parseNumber(query.page, 1);
  const perPage = parseNumber(query.perPage, 10);

  const sortField = parseString(query.sortField) || "createdAt";
  const sortOrder = parseString(query.sortOrder) === "asc" ? 1 : -1;

  const filters: FileQueryFilters = {};

  const name = parseString(query.name);
  if (name) filters.name = name;

  const url = parseString(query.url);
  if (url) filters.url = url;

  const userId = parseString(query.userId);
  if (userId) filters.userId = userId;

  return {
    pagination: { page, perPage, sort: { [sortField]: sortOrder as 1 | -1 } },
    filters,
  };
};
