import express from "express";
import * as newsControllers from "../controllers/newsController.js"; // або newsHandlers.js, якщо так у тебе називається
import { ctrlWrapper } from "../utils/ctrlWrapper.js";

const router = express.Router();

router.post("/", ctrlWrapper(newsControllers.createNewsController));
router.get("/", ctrlWrapper(newsControllers.getAllNewsController));
router.delete("/:newsId", ctrlWrapper(newsControllers.deleteNewsController));

export default router;
