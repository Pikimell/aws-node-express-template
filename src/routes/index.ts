import { Router } from "express";
import openaiRouter from "./openai.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/openai", openaiRouter);

export default router;
