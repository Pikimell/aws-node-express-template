import { Joi, Segments } from "celebrate";

const schedulerExpressionSchema = Joi.string()
  .trim()
  .pattern(/^(rate\(\s*(?:1\s+(?:minute|hour|day|week)|\d+\s+(?:minutes|hours|days|weeks))\s*\)|cron\([^\n]+\))$/)
  .messages({
    "string.pattern.base":
      "expression must be a valid EventBridge Scheduler rate(...) or cron(...) expression. Allowed rate units: minute(s), hour(s), day(s), week(s). Cron expression must use cron(...).",
  });

const payloadSchema = Joi.object().unknown(true).required();

export const createOnceScheduleSchema = {
  [Segments.BODY]: Joi.object({
    runAt: Joi.date().iso().required(),
    payload: payloadSchema,
  }),
};

export const createRecurringScheduleSchema = {
  [Segments.BODY]: Joi.object({
    frequency: Joi.string().valid("daily", "weekly"),
    expression: schedulerExpressionSchema,
    payload: payloadSchema,
  })
    .xor("frequency", "expression")
    .messages({
      "object.xor":
        "Provide exactly one scheduling option: frequency or expression.",
    }),
};
