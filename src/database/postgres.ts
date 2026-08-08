import type { RequestHandler } from "express";
import { Pool, type QueryResultRow } from "pg";

import { DATABASE_URL, POSTGRES_SSL } from "../helpers/constants.js";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: POSTGRES_SSL
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

let isInitialized = false;

export const query = <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) => pool.query<T>(text, params);

export const initPostgres: RequestHandler = async (_req, _res, next) => {
  if (isInitialized) {
    next();
    return;
  }

  try {
    await pool.query("select 1");
    isInitialized = true;
    console.log("PostgreSQL connection successfully established!");
    next();
  } catch (e) {
    console.log("Error while setting up PostgreSQL connection", e);
    next(e);
  }
};
