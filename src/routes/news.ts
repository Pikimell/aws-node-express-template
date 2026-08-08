import { Router } from "express";
import * as newsControllers from "../controllers/newsController.js";
import { authenticate, authorizeRoles } from "../middlewares/authenticate.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  validateCreateNews,
  validateDeleteNews,
  validateGetAllNews,
} from "../validations/news.js";

const router = Router();

router.post(
  "/",
  validateCreateNews,
  authenticate,
  authorizeRoles("admin"),
  ctrlWrapper(newsControllers.createNewsController)
);
router.get("/", validateGetAllNews, ctrlWrapper(newsControllers.getAllNewsController));
router.delete(
  "/:newsId",
  validateDeleteNews,
  authenticate,
  authorizeRoles("admin"),
  ctrlWrapper(newsControllers.deleteNewsController)
);

export default router;
