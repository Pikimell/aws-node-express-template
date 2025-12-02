import { Router } from "express";
import authRouter from "./auth.js";
import newsRouter from "./news.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/news", newsRouter);

export default router;
