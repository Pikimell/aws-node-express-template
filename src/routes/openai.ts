import { Router } from "express";
import type { RequestHandler } from "express";
import { celebrate } from "celebrate";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { createChatCompletion } from "../services/openaiService.js";
import { createChatCompletionSchema } from "../validations/openai.js";

type ChatCompletionRequestBody = {
  model: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  maxTokens?: number;
};

const createChatCompletionHandler: RequestHandler = async (req, res, next) => {
  try {
    const { model, messages, temperature, maxTokens } = req.body as ChatCompletionRequestBody;

    const completion = await createChatCompletion({
      model,
      messages,
      temperature,
      maxTokens,
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

router.post(
  "/chat/completions",
  celebrate(createChatCompletionSchema),
  createChatCompletionHandler,
);

export default router;
