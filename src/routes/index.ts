import { Router } from "express";
import authRouter from "./auth.js";
import carsRouter from "./cars.js";
import newsRouter from "./news.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/cars", carsRouter);
router.use("/news", newsRouter);

export default router;
