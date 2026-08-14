import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status =
    typeof err === "object" && err !== null && "status" in err && typeof err.status === "number"
      ? err.status
      : 500;
  const message = err instanceof Error ? err.message : "Something went wrong";

  res.status(status).json({
    status,
    message,
  });
};
