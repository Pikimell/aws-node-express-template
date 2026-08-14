import { Router } from "express";
import type { RequestHandler } from "express";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { createChatCompletion } from "../services/openaiService.js";

type ChatCompletionRequestBody = {
  model?: unknown;
  messages?: unknown;
  temperature?: unknown;
  maxTokens?: unknown;
};

const allowedRoles = new Set(["system", "user", "assistant", "developer"]);

const createHttpError = (status: number, message: string) => {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
};

const parseMessages = (messages: unknown): ChatCompletionMessageParam[] => {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw createHttpError(400, "messages must be a non-empty array");
  }

  return messages.map((message, index) => {
    if (typeof message !== "object" || message === null) {
      throw createHttpError(400, `messages[${index}] must be an object`);
    }

    const { role, content } = message as { role?: unknown; content?: unknown };

    if (typeof role !== "string" || !allowedRoles.has(role)) {
      throw createHttpError(400, `messages[${index}].role is invalid`);
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      throw createHttpError(400, `messages[${index}].content must be a non-empty string`);
    }

    return { role, content } as ChatCompletionMessageParam;
  });
};

const parseOptionalNumber = (value: unknown, fieldName: string) => {
  if (value === undefined) return undefined;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw createHttpError(400, `${fieldName} must be a number`);
  }

  return value;
};

const createChatCompletionHandler: RequestHandler = async (req, res, next) => {
  try {
    const { model, messages, temperature, maxTokens } = req.body as ChatCompletionRequestBody;

    if (typeof model !== "string" || model.trim().length === 0) {
      throw createHttpError(400, "model must be a non-empty string");
    }

    const completion = await createChatCompletion({
      model,
      messages: parseMessages(messages),
      temperature: parseOptionalNumber(temperature, "temperature"),
      maxTokens: parseOptionalNumber(maxTokens, "maxTokens"),
    });

    res.status(200).json({
      message: completion.choices[0]?.message ?? null,
      completion,
    });
  } catch (error) {
    next(error);
  }
};

const router = Router();

router.post("/chat/completions", createChatCompletionHandler);

export default router;
