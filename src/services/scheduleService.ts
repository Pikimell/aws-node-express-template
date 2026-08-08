import {
  CreateScheduleCommand,
  FlexibleTimeWindowMode,
  SchedulerClient,
} from "@aws-sdk/client-scheduler";
import createError from "http-errors";

type SchedulePayload = Record<string, unknown>;

type CreateOnceScheduleParams = {
  runAt: string;
  payload: SchedulePayload;
};

type CreateRecurringScheduleParams = {
  frequency?: "daily" | "weekly";
  expression?: string;
  payload: SchedulePayload;
};

const scheduler = new SchedulerClient({});

const callbackLambdaArn = process.env.SCHEDULE_CALLBACK_LAMBDA_ARN;
const schedulerRoleArn = process.env.SCHEDULER_ROLE_ARN;

const createScheduleName = () => {
  const random = Math.random().toString(36).slice(2, 10);
  return `generic-schedule-${Date.now()}-${random}`;
};

const getSchedulerTarget = (payload: SchedulePayload) => {
  if (!callbackLambdaArn || !schedulerRoleArn) {
    throw createError(
      500,
      "Scheduler target is not configured. Check SCHEDULE_CALLBACK_LAMBDA_ARN and SCHEDULER_ROLE_ARN.",
    );
  }

  return {
    Arn: callbackLambdaArn,
    RoleArn: schedulerRoleArn,
    Input: JSON.stringify(payload),
  };
};

const normalizeUtcAtExpression = (runAt: string) => {
  const date = new Date(runAt);

  if (Number.isNaN(date.getTime())) {
    throw createError(400, "runAt must be a valid ISO date.");
  }

  if (date.getTime() <= Date.now()) {
    throw createError(400, "runAt must be a future date.");
  }

  return `at(${date.toISOString().replace(/\.\d{3}Z$/, "")})`;
};

const resolveRecurringExpression = ({
  frequency,
  expression,
}: Pick<CreateRecurringScheduleParams, "frequency" | "expression">) => {
  if (expression) {
    return expression;
  }

  if (frequency === "daily") {
    return "rate(1 day)";
  }

  if (frequency === "weekly") {
    return "rate(1 week)";
  }

  throw createError(400, "frequency or expression is required.");
};

export const createOnceSchedule = async ({
  runAt,
  payload,
}: CreateOnceScheduleParams) => {
  const name = createScheduleName();
  const scheduleExpression = normalizeUtcAtExpression(runAt);

  await scheduler.send(
    new CreateScheduleCommand({
      Name: name,
      ScheduleExpression: scheduleExpression,
      ScheduleExpressionTimezone: "UTC",
      ActionAfterCompletion: "DELETE",
      FlexibleTimeWindow: {
        Mode: FlexibleTimeWindowMode.OFF,
      },
      Target: getSchedulerTarget(payload),
    }),
  );

  return {
    name,
    type: "once",
    scheduleExpression,
    timezone: "UTC",
  };
};

export const createRecurringSchedule = async ({
  frequency,
  expression,
  payload,
}: CreateRecurringScheduleParams) => {
  const name = createScheduleName();
  const scheduleExpression = resolveRecurringExpression({
    frequency,
    expression,
  });

  await scheduler.send(
    new CreateScheduleCommand({
      Name: name,
      ScheduleExpression: scheduleExpression,
      FlexibleTimeWindow: {
        Mode: FlexibleTimeWindowMode.OFF,
      },
      Target: getSchedulerTarget(payload),
    }),
  );

  return {
    name,
    type: "recurring",
    frequency,
    scheduleExpression,
  };
};
