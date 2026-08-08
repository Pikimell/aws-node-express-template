# AWS Node Express API

Backend API на Node.js, Express і TypeScript з підтримкою запуску локально та деплою в AWS Lambda через Serverless Framework. Дані зберігаються в MongoDB Atlas, файли завантажуються в AWS S3 через signed URL.

## Що реалізовано

- Express API з TypeScript та ESM-модулями.
- Підключення до MongoDB через Mongoose з кешуванням з'єднання для Lambda.
- Авторизація:
  - реєстрація користувача;
  - логін з JWT access token;
  - refresh token у `httpOnly` cookie;
  - logout;
  - отримання поточного користувача через `GET /auth/me`.
- Сесії користувачів у MongoDB з TTL-індексом за `expiresAt`.
- CRUD для файлів у MongoDB.
- Генерація signed URL для прямого PUT-завантаження файлів у S3.
- CRUD для новин: створення, список з фільтрами/сортуванням/пагінацією, видалення.
- Валідація запитів через `celebrate`/`Joi`.
- Swagger-документація:
  - UI: `GET /docs`
  - JSON: `GET /docs.json`
- AWS Serverless конфіг:
  - Lambda handler `dist/index.handler`;
  - HTTP API для всіх маршрутів;
  - S3 bucket для файлів;
  - IAM-доступ Lambda до `s3:PutObject`;
  - публічне читання об'єктів з bucket.

## Основні маршрути

### Auth

- `POST /auth/register`
  - body: `email`, `password`, опційно `nickname`, `role`
- `POST /auth/login`
  - body: `email`, `password`
  - повертає `accessToken` і встановлює cookies `accessToken`, `refreshToken`
- `POST /auth/refresh`
  - використовує cookie `refreshToken`
  - повертає новий `accessToken`
- `POST /auth/logout`
  - видаляє refresh session і очищує cookies
- `GET /auth/me`
  - потребує `accessToken` у cookie або `Authorization: Bearer <token>`

### Files

- `POST /files`
  - body: `userId`, `name`, `url`
- `GET /files`
  - query: `page`, `perPage`, `sortField`, `sortOrder`, `name`, `url`, `userId`
- `GET /files/:fileId`
- `PATCH /files/:fileId`
  - body: будь-яке з полів `userId`, `name`, `url`
- `DELETE /files/:fileId`
- `POST /files/upload-url`
  - body: `fileName`, опційно `contentType`
  - повертає `uploadSignedUrl` для PUT-завантаження і `publicUrl` для збереження в базі

### News

- `POST /news`
  - body: `userId`, `type`, `typeAccount`, `topic`, `text`, опційно `files`
  - `type`: `updates`, `news`, `testimonials`, `video stories`
  - `typeAccount`: `freeUser`, `paidUser`, `agencyUser`
- `GET /news`
  - query: `page`, `perPage`, `sortField`, `sortOrder`, `topic`, `type`, `typeAccount`, `userId`
- `DELETE /news/:newsId`

## Вимоги

- Node.js 22 або сумісна версія.
- npm.
- MongoDB Atlas або інший MongoDB cluster з SRV-підключенням.
- AWS акаунт для S3/Lambda деплою.
- Serverless Framework v4 для деплою.
- Налаштовані AWS credentials для локальної генерації S3 signed URL та деплою.

## Встановлення

```bash
npm install
```

## Змінні середовища

Створи `.env` у корені проєкту:

```env
PORT=3000
NODE_ENV=development

MONGODB_USER=your_mongodb_user
MONGODB_PASSWORD=your_mongodb_password
MONGODB_URL=your_cluster.mongodb.net
MONGODB_DB=your_database_name

JWT_ACCESS_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRES_IN=1d

AWS_REGION=us-east-1
FILES_BUCKET_NAME=your_s3_bucket_name
```

Пояснення:

- `MONGODB_USER`, `MONGODB_PASSWORD`, `MONGODB_URL`, `MONGODB_DB` використовуються для формування рядка `mongodb+srv://...`.
- `JWT_ACCESS_SECRET` обов'язковий для підпису access token.
- `ACCESS_TOKEN_EXPIRES_IN` опційний, за замовчуванням `1d`.
- `AWS_REGION` опційний, за замовчуванням `us-east-1`.
- `FILES_BUCKET_NAME` потрібен для `POST /files/upload-url`. Під час деплою Serverless сам передає назву bucket у Lambda.

## AWS credentials

Для роботи з S3 та деплою налаштуй AWS CLI:

```bash
aws configure --profile yourProfileName
export AWS_PROFILE=yourProfileName
```

Або використовуй стандартні змінні середовища:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

## Локальний запуск

```bash
npm run dev
```

За замовчуванням сервер стартує на:

```text
http://localhost:3000
```

Swagger буде доступний за адресою:

```text
http://localhost:3000/docs
```

## Production-запуск після компіляції

```bash
npm start
```

Ця команда компілює TypeScript у `dist` і запускає `node dist/index.js`.

## Деплой в AWS

Встанови Serverless Framework, якщо він ще не встановлений:

```bash
npm install -g serverless
```

Деплой:

```bash
npm run deploy
```

Команда збирає TypeScript і виконує `sls deploy`.

`serverless.yml` створює:

- Lambda-функцію `api`;
- HTTP API Gateway;
- S3 bucket для файлів;
- bucket policy для публічного читання файлів;
- CORS для PUT-завантажень у S3;
- IAM permission для запису файлів у bucket.

## Завантаження файлу в S3

1. Отримай signed URL:

```http
POST /files/upload-url
Content-Type: application/json

{
  "fileName": "photo.png",
  "contentType": "image/png"
}
```

2. Завантаж файл напряму в S3 методом `PUT` на `uploadSignedUrl`.
3. Збережи `publicUrl` через `POST /files`, якщо файл потрібно мати в MongoDB.

## Корисні npm scripts

- `npm run dev` - локальний запуск через `nodemon` і `ts-node`.
- `npm run build` - компіляція TypeScript у `dist`.
- `npm start` - build + production-запуск.
- `npm run deploy` - build + Serverless deploy.
