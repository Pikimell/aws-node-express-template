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
      File: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userId: { type: "string" },
          name: { type: "string" },
          url: { type: "string", format: "uri" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      FileInput: {
        type: "object",
        properties: {
          userId: { type: "string" },
          name: { type: "string" },
          url: { type: "string", format: "uri" },
        },
        required: ["userId", "name", "url"],
      },
      FileUploadSignedUrlInput: {
        type: "object",
        properties: {
          fileName: { type: "string" },
          contentType: { type: "string" },
        },
        required: ["fileName"],
      },
      FileUploadSignedUrlResponse: {
        type: "object",
        properties: {
          uploadSignedUrl: { type: "string", format: "uri" },
          publicUrl: { type: "string", format: "uri" },
        },
      },
      FilesListResponse: {
        type: "object",
        properties: {
          page: { type: "number" },
          perPage: { type: "number" },
          totalItems: { type: "number" },
          totalPages: { type: "number" },
          hasPreviousPage: { type: "boolean" },
          hasNextPage: { type: "boolean" },
          files: {
            type: "array",
            items: { $ref: "#/components/schemas/File" },
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
    "/files": {
      get: {
        tags: ["Files"],
        summary: "Отримати список файлів",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "perPage", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "sortField", in: "query", schema: { type: "string", enum: ["createdAt", "updatedAt", "name", "url"] } },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
          { name: "name", in: "query", schema: { type: "string" } },
          { name: "url", in: "query", schema: { type: "string" } },
          { name: "userId", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Список файлів",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FilesListResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Files"],
        summary: "Створити файл",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FileInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Файл створено",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/File" },
              },
            },
          },
        },
      },
    },
    "/files/upload-url": {
      post: {
        tags: ["Files"],
        summary: "Отримати signed URL для прямого завантаження файлу в S3",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FileUploadSignedUrlInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "URL для завантаження та публічний URL файлу",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FileUploadSignedUrlResponse" },
              },
            },
          },
        },
      },
    },
    "/files/{fileId}": {
      get: {
        tags: ["Files"],
        summary: "Отримати файл за ID",
        parameters: [
          { name: "fileId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Дані файлу",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/File" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Files"],
        summary: "Оновити файл",
        parameters: [
          { name: "fileId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FileInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Файл оновлено",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/File" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Files"],
        summary: "Видалити файл",
        parameters: [
          { name: "fileId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Файл видалено",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/File" },
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
