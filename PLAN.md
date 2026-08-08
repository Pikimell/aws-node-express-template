- mongodb — готове підключення до MongoDB/Mongoose, базовий repository/service
  layer, env-конфіг, connection reuse для Lambda.
- postgres-prisma — PostgreSQL + Prisma, міграції, seed, приклад CRUD.
- dynamodb — DynamoDB через AWS SDK, CRUD, pagination, indexes.
- sqs — producer + consumer для SQS, окремий Lambda handler, retry/DLQ.
- eventbridge — подієва архітектура: сервер створює event, окрема Lambda його
  обробляє.
- cron — scheduled jobs через EventBridge Scheduler / Serverless schedule,
  наприклад щоденне очищення даних або email digest.
- ses-email — відправка email через AWS SES: welcome, reset password,
  notification.
- cognito-roles — Cognito Groups + middleware типу requireAuth,
  requireRole("admin").
- cognito-s3 — вже комбінований production-like варіант: Cognito + S3 +
  permission checks.
- presigned-s3 — я б навіть виділив окремо від звичайного S3: backend повертає
  presigned URL, а frontend завантажує файл напряму в S3.
- file-processing — S3 trigger → Lambda, наприклад після upload автоматично
  обробити файл/картинку.
- image-processing — S3 + Sharp: завантажили картинку → зробили thumbnail/webp →
  поклали назад у bucket.
- websocket — API Gateway WebSocket + Lambda; connection/disconnection/send
  message.
- rate-limit — rate limiting, API throttling, middleware, можливо Redis/Upstash.
- redis-cache — кешування запитів, TTL, invalidation.
- validation — готовий шаблон celebrate/Joi, custom error messages, centralized
  validation middleware.
- error-handling — своя ієрархія AppError, глобальний error middleware,
  AWS/Cognito/DB error mapping.
- logging — structured logger (pino), request id, CloudWatch-friendly logs.
- observability — CloudWatch metrics/alarms, Lambda errors, API Gateway 5xx,
  possibly X-Ray.
- swagger — OpenAPI/Swagger документація + /docs.
- testing — Jest/Vitest + Supertest, unit/service/controller tests, mocks AWS
  SDK.
- docker — локальний запуск через Docker/Docker Compose.
- localstack — локальна емуляція S3/SQS/DynamoDB та інших AWS сервісів.
- github-actions — CI/CD: lint → test → build → serverless deploy.
- secrets-manager — AWS Secrets Manager / SSM Parameter Store замість секретів у
  .env.
- cors-security — Helmet, CORS configuration, request size limits, security
  defaults.
- pagination-filtering — універсальна pagination/sort/filter/search схема для
  REST API.
- soft-delete — CRUD з deletedAt, restore, admin-only hard delete.
- audit-log — хто, коли і що змінив; дуже корисний reusable модуль.
- stripe — Stripe Checkout/Webhooks/subscriptions, якщо часто робиш SaaS.
- webhooks — універсальний webhook receiver з signature validation та
  idempotency.
- idempotency — захист POST/payment/job endpoint’ів від повторного виконання.
- health-check — /health, /ready, перевірка DB/AWS dependencies.
- upload-multipart — якщо потрібен класичний upload через Express/Multer, а не
  presigned URL.
- background-jobs — API приймає запит → SQS → worker → статус job через
  endpoint.
- multi-env — dev/staging/prod, різні AWS resources, env variables, domains і
  serverless stages.
