import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (req, _res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const time = new Date().toISOString();

  console.log(`\n📥 [${time.split("T")[1].split(".")[0]}] ${method} ${url}`);

  next();
};
