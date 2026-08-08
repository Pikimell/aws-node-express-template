import { celebrate } from "celebrate";
import { Router } from "express";

import * as scheduleControllers from "../controllers/scheduleController.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  createOnceScheduleSchema,
  createRecurringScheduleSchema,
} from "../validations/schedule.js";

const router = Router();

router.post(
  "/once",
  celebrate(createOnceScheduleSchema),
  ctrlWrapper(scheduleControllers.createOnceScheduleController),
);

router.post(
  "/recurring",
  celebrate(createRecurringScheduleSchema),
  ctrlWrapper(scheduleControllers.createRecurringScheduleController),
);

export default router;
