import type { ParsedQs } from "qs";

import type { CarQueryFilters } from "../services/carService.js";

type CarsQuery = ParsedQs & {
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

export const parseCarsQuery = (query: CarsQuery) => {
  const page = parseNumber(query.page, 1);
  const perPage = parseNumber(query.perPage, 10);

  const sortField = parseString(query.sortField) || "createdAt";
  const sortOrder = parseString(query.sortOrder) === "asc" ? 1 : -1;

  const filters: CarQueryFilters = {};

  const userId = parseString(query.userId);
  if (userId) filters.userId = userId;

  const make = parseString(query.make);
  if (make) filters.make = make;

  const model = parseString(query.model);
  if (model) filters.model = model;

  const year = parseNumber(query.year, 0);
  if (year) filters.year = year;

  const color = parseString(query.color);
  if (color) filters.color = color;

  const vin = parseString(query.vin);
  if (vin) filters.vin = vin;

  return {
    pagination: { page, perPage, sort: { [sortField]: sortOrder as 1 | -1 } },
    filters,
  };
};
