import { Router } from "express";
import authRouter from "./auth.js";
import emailRouter from "./email.js";
import newsRouter from "./news.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/email", emailRouter);
router.use("/news", newsRouter);

export default router;
