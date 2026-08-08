import { env } from "../utils/env.js";

export const ONE_HOUR = 60 * 60 * 1000;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;
export const ONE_MONTH = ONE_DAY * 31;

export const ACCESS_TOKEN_SECRET = env("JWT_ACCESS_SECRET");
export const ACCESS_TOKEN_EXPIRES_IN = env("ACCESS_TOKEN_EXPIRES_IN", "1d");

export const DATABASE_URL = env("DATABASE_URL");
export const POSTGRES_SSL = env("POSTGRES_SSL", "true") === "true";
