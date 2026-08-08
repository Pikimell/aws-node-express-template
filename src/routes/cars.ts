import { celebrate } from 'celebrate';
import { Router } from 'express';
import * as carsControllers from '../controllers/carController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  createCarSchema,
  deleteCarSchema,
  getCarsAggregationSchema,
  getCarByIdSchema,
  getCarsSchema,
  updateCarSchema,
} from '../validations/cars.js';

const router = Router();

router.post(
  '/',
  celebrate(createCarSchema),
  ctrlWrapper(carsControllers.createCarController),
);
router.get(
  '/',
  celebrate(getCarsSchema),
  ctrlWrapper(carsControllers.getAllCarsController),
);
router.get(
  '/stats/by-make',
  celebrate(getCarsAggregationSchema),
  ctrlWrapper(carsControllers.getCarsStatsByMakeController),
);
router.get(
  '/stats/by-year',
  celebrate(getCarsAggregationSchema),
  ctrlWrapper(carsControllers.getCarsStatsByYearController),
);
router.get(
  '/stats/summary',
  celebrate(getCarsAggregationSchema),
  ctrlWrapper(carsControllers.getCarsSummaryController),
);
router.get(
  '/:carId',
  celebrate(getCarByIdSchema),
  ctrlWrapper(carsControllers.getCarByIdController),
);
router.patch(
  '/:carId',
  celebrate(updateCarSchema),
  ctrlWrapper(carsControllers.updateCarController),
);
router.delete(
  '/:carId',
  celebrate(deleteCarSchema),
  ctrlWrapper(carsControllers.deleteCarController),
);

export default router;
