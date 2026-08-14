import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "AWS Node Express Template API",
    version: "1.0.0",
    description: "Express API для виконання запитів до OpenAI без авторизації та бази даних.",
  },
  servers: [
    {
      url: "/",
      description: "Локальний або продакшн сервер",
    },
  ],
  paths: {
    "/openai/chat/completions": {
      post: {
        tags: ["OpenAI"],
        summary: "Створити ChatGPT completion",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["model", "messages"],
                properties: {
                  model: {
                    type: "string",
                    example: "gpt-4o-mini",
                  },
                  messages: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["role", "content"],
                      properties: {
                        role: {
                          type: "string",
                          enum: ["system", "developer", "user", "assistant"],
                          example: "user",
                        },
                        content: {
                          type: "string",
                          example: "Привіт! Поясни TypeScript generics простими словами.",
                        },
                      },
                    },
                  },
                  temperature: {
                    type: "number",
                    example: 0.7,
                  },
                  maxTokens: {
                    type: "number",
                    example: 500,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Відповідь OpenAI",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "object",
                    },
                    completion: {
                      type: "object",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Некоректне тіло запиту",
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["System"],
        summary: "Перевірка стану API",
        responses: {
          200: {
            description: "API працює",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
