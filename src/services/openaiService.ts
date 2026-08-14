import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { env } from "../utils/env.js";

export type CreateChatCompletionInput = {
  model: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  maxTokens?: number;
};

export const createChatCompletion = async ({
  model,
  messages,
  temperature,
  maxTokens,
}: CreateChatCompletionInput) => {
  const openai = new OpenAI({
    apiKey: env("OPENAI_API_KEY"),
  });

  return openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });
};
