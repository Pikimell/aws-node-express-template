import type { ErrorRequestHandler } from "express";
import { HttpError } from "http-errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isHttp = err instanceof HttpError;
  const status = isHttp
    ? err.statusCode || err.status || 500
    : 500;
  const message = isHttp ? err.message : "Something went wrong";
  const data = isHttp ? err : { message: err instanceof Error ? err.message : "Unexpected error" };

  res.status(status).json({
    status,
    message,
    data,
  });
};
