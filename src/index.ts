import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errors } from "celebrate";

import { initMongoDB } from "./database/initMongoDb.js";
import { printRoutes } from "./helpers/printRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import router from "./routes/index.js";
import { requestLogger } from "./middlewares/requestLogger.js";

const app = express();

app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());

app.use(initMongoDB);

app.use(requestLogger);

app.use(router);

app.use(errors());
app.use(errorHandler);

printRoutes(app);
export const handler = serverless(app);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Express server running on http://localhost:${PORT}`);
  });
}
