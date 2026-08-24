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
  '/cars',
  celebrate(createCarSchema),
  ctrlWrapper(carsControllers.createCarController),
);
router.get(
  '/cars',
  celebrate(getCarsSchema),
  ctrlWrapper(carsControllers.getAllCarsController),
);
router.get(
  '/cars/stats/by-make',
  celebrate(getCarsAggregationSchema),
  ctrlWrapper(carsControllers.getCarsStatsByMakeController),
);
router.get(
  '/cars/stats/by-year',
  celebrate(getCarsAggregationSchema),
  ctrlWrapper(carsControllers.getCarsStatsByYearController),
);
router.get(
  '/cars/stats/summary',
  celebrate(getCarsAggregationSchema),
  ctrlWrapper(carsControllers.getCarsSummaryController),
);
router.get(
  '/cars/:carId',
  celebrate(getCarByIdSchema),
  ctrlWrapper(carsControllers.getCarByIdController),
);
router.patch(
  '/cars/:carId',
  celebrate(updateCarSchema),
  ctrlWrapper(carsControllers.updateCarController),
);
router.delete(
  '/cars/:carId',
  celebrate(deleteCarSchema),
  ctrlWrapper(carsControllers.deleteCarController),
);

export default router;
