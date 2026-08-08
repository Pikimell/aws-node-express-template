import { Router } from "express";
import authRouter from "./auth.js";
import newsRouter from "./news.js";
import schedulesRouter from "./schedules.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/news", newsRouter);
router.use("/schedules", schedulesRouter);

export default router;
