# AWS Node Express Template

> A production-oriented starting point for authenticated TypeScript APIs that can run locally or on AWS Lambda.

The template combines Express, TypeScript, ESM, MongoDB/Mongoose, JWT authentication, HTTP-only cookies, refresh-token sessions, request validation, CRUD routes, Swagger/OpenAPI, and Serverless Framework deployment.

## Features

- Registration, login, logout, refresh-token rotation, and current-user endpoint.
- News CRUD with pagination, sorting, and filtering.
- `celebrate`/`Joi` request validation and centralized middleware.
- Swagger UI at `/docs` and OpenAPI JSON at `/docs.json`.
- Local HTTP server and AWS Lambda handler through `serverless-http`.

## Requirements

Node.js 22, npm, MongoDB, and AWS CLI/Serverless Framework for deployment.

Create `.env` with MongoDB connection settings and `JWT_ACCESS_SECRET`.

## Run locally

```bash
npm install
npm run dev
```

API: `http://localhost:3000` · Swagger: `http://localhost:3000/docs` · OpenAPI: `http://localhost:3000/docs.json`

## Deploy to AWS

Configure an AWS profile and run `npm run deploy`. The current Serverless configuration uses Node.js 22 and `dist/index.handler`.

## Useful commands

- `npm run dev` — development server.
- `npm run build` — compile TypeScript.
- `npm start` — build and start the compiled server.
- `npm run deploy` — build and deploy with Serverless Framework.

Ukrainian documentation: [README-uk.md](README-uk.md).
