import { HttpError } from "http-errors";

export const errorHandler = (err, req, res, next) => {
  const isHttp = err instanceof HttpError;

  const status = isHttp ? err.status : 500;
  const message = isHttp ? err.message : "Something went wrong";
  const data = isHttp ? err : { message: err.message };

  res.status(status).json({
    status,
    message,
    data,
  });
};
