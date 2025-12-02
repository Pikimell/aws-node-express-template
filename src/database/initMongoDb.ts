import type { RequestHandler } from "express";
import mongoose from "mongoose";

import {
  MONGODB_DB,
  MONGODB_PASSWORD,
  MONGODB_URL,
  MONGODB_USER,
} from "../helpers/constants.js";

let cachedDb: typeof mongoose | null = null;

export const initMongoDB: RequestHandler = async (_req, _res, next) => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log("Already connected!");
    next();
    return;
  }

  try {
    const user = MONGODB_USER;
    const pwd = MONGODB_PASSWORD;
    const url = MONGODB_URL;
    const db = MONGODB_DB;

    const connection = await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority&ssl=true`
    );

    console.log("Mongo connection successfully established!");
    cachedDb = connection;
    next();
  } catch (e) {
    console.log("Error while setting up mongo connection", e);
    next(e);
  }
};
