import { Router } from 'express';
import authRouter from './auth.js';
import carsRouter from './cars.js';
import newsRouter from './news.js';

const router = Router();

router.use(authRouter);
router.use(carsRouter);
router.use(newsRouter);

export default router;
