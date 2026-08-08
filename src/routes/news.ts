import { celebrate } from 'celebrate';
import { Router } from 'express';
import * as newsControllers from '../controllers/newsController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  createNewsSchema,
  deleteNewsSchema,
  getNewsSchema,
} from '../validations/news.js';

const router = Router();

router.post(
  '/',
  celebrate(createNewsSchema),
  ctrlWrapper(newsControllers.createNewsController),
);
router.get(
  '/',
  celebrate(getNewsSchema),
  ctrlWrapper(newsControllers.getAllNewsController),
);
router.delete(
  '/:newsId',
  celebrate(deleteNewsSchema),
  ctrlWrapper(newsControllers.deleteNewsController),
);

export default router;
