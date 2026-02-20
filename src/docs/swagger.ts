import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Auth API",
    version: "1.0.0",
    description: "API для керування реєстрацією, логіном і сесіями користувачів.",
  },
  servers: [
    {
      url: "/",
      description: "Локальний або продакшн сервер",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterInput: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
          nickname: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] },
        },
        required: ["email", "password"],
      },
      LoginInput: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
        required: ["email", "password"],
      },
      TokensResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
      },
      LogoutResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              _id: { type: "string" },
              email: { type: "string" },
              nickname: { type: "string" },
              role: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Реєстрація нового користувача",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Користувач зареєстрований",
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Отримати access/refresh токени",
        description: "Сервер записує accessToken та refreshToken у HTTP-only cookie.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginInput",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Токени повернені у тілі та кукі",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TokensResponse",
                },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Вийти (видалити сесію)",
        responses: {
          "200": {
            description: "Сесія завершена",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LogoutResponse",
                },
              },
            },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Оновити accessToken",
        description: "Потрібен refreshToken у HTTP-only cookie.",
        responses: {
          "200": {
            description: "Нові токени",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TokensResponse",
                },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Інформація про поточного користувача",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Дані користувача",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserResponse",
                },
              },
            },
          },
          "401": {
            description: "Токен не надано або недійсний",
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
