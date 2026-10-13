# AWS Node Express Template

> A production-oriented starting point for authenticated TypeScript APIs that can run locally or on AWS Lambda.

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?logo=awslambda&logoColor=white)
![Swagger](https://img.shields.io/badge/OpenAPI-85EA2D?logo=swagger&logoColor=black)

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

## Author

**Volodymyr Pashchenko**, Full-stack Developer · [GitHub](https://github.com/Pikimell) · [LinkedIn](https://www.linkedin.com/in/pashchenko-v-r)
