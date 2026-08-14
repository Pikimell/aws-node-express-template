import { Joi, Segments } from "celebrate";

export const openAiChatModels = [
  "gpt-5.1",
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-5-chat-latest",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "o4-mini",
  "o3",
  "o3-mini",
  "o1",
  "o1-mini",
  "o1-preview",
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-3.5-turbo",
] as const;

export const openAiChatMessageRoles = ["system", "developer", "user", "assistant"] as const;

const chatMessageSchema = Joi.object({
  role: Joi.string()
    .valid(...openAiChatMessageRoles)
    .required()
    .messages({
      "any.only": `messages[].role must be one of: ${openAiChatMessageRoles.join(", ")}`,
      "any.required": "messages[].role is required",
      "string.base": "messages[].role must be a string",
    }),
  content: Joi.string().trim().min(1).required().messages({
    "any.required": "messages[].content is required",
    "string.base": "messages[].content must be a string",
    "string.empty": "messages[].content cannot be empty",
    "string.min": "messages[].content cannot be empty",
  }),
});

export const createChatCompletionSchema = {
  [Segments.BODY]: Joi.object({
    model: Joi.string()
      .trim()
      .valid(...openAiChatModels)
      .required()
      .messages({
        "any.only": `model must be one of: ${openAiChatModels.join(", ")}`,
        "any.required": "model is required",
        "string.base": "model must be a string",
        "string.empty": "model cannot be empty",
      }),
    messages: Joi.array().items(chatMessageSchema).min(1).required().messages({
      "any.required": "messages is required",
      "array.base": "messages must be an array",
      "array.min": "messages must include at least one message",
    }),
    temperature: Joi.number().min(0).max(2).messages({
      "number.base": "temperature must be a number",
      "number.min": "temperature must be greater than or equal to 0",
      "number.max": "temperature must be less than or equal to 2",
    }),
    maxTokens: Joi.number().integer().positive().messages({
      "number.base": "maxTokens must be a number",
      "number.integer": "maxTokens must be an integer",
      "number.positive": "maxTokens must be greater than 0",
    }),
  }),
};
