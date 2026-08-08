import type { RequestHandler } from "express";

import * as services from "../services/scheduleService.js";

export const createOnceScheduleController: RequestHandler = async (req, res) => {
  const result = await services.createOnceSchedule(req.body);

  res.status(201).json(result);
};

export const createRecurringScheduleController: RequestHandler = async (
  req,
  res,
) => {
  const result = await services.createRecurringSchedule(req.body);

  res.status(201).json(result);
};
