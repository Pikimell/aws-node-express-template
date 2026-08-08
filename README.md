# AWS Node Express Template

TypeScript API на Express для запуску локально як звичайний HTTP-сервер і для деплою в AWS Lambda через Serverless Framework. Проєкт працює з PostgreSQL, зокрема з Supabase Postgres, через прямий `DATABASE_URL` і SQL-запити без `supabase-js`.

## Що реалізовано

- Express API з TypeScript та ESM-модулями.
- Пряме підключення до PostgreSQL через `pg`.
- Реєстрація, логін, logout, refresh token і отримання поточного користувача.
- Хешування паролів через `bcryptjs`.
- Access token через JWT та refresh token у таблиці `sessions`.
- HTTP-only cookie `accessToken` і `refreshToken`.
- Валідація запитів через `celebrate`/`Joi`.
- CRUD для `news` і `cars`.
- Пагінація, сортування і фільтрація списків.
- SQL-агрегації для статистики авто.
- Swagger UI на `/docs` і OpenAPI JSON на `/docs.json`.
- Обгортка `serverless-http` для запуску Express у AWS Lambda.

## Основні маршрути

### Auth

- `POST /auth/register` - реєстрація користувача.
- `POST /auth/login` - логін, створення сесії та встановлення cookie з токенами.
- `POST /auth/logout` - видалення refresh token сесії.
- `POST /auth/refresh` - ротація refresh token і видача нового access token.
- `GET /auth/me` - дані поточного користувача, потрібен Bearer access token або cookie `accessToken`.

### News

- `GET /news` - список новин.
- `POST /news` - створення новини.
- `DELETE /news/:newsId` - видалення новини за UUID.

### Cars

- `GET /cars` - список авто.
- `POST /cars` - створення авто.
- `GET /cars/:carId` - отримання авто за UUID.
- `PATCH /cars/:carId` - оновлення авто.
- `DELETE /cars/:carId` - видалення авто.
- `GET /cars/stats/by-make` - статистика авто за виробником.
- `GET /cars/stats/by-year` - статистика авто за роком.
- `GET /cars/stats/summary` - загальна статистика авто.

## Необхідні налаштування

Потрібні:

- Node.js 22 або сумісна версія.
- npm.
- Supabase проєкт з Postgres database або будь-яка PostgreSQL база.
- Для деплою: AWS CLI, Serverless Framework v4 і налаштований AWS profile.

## Як взяти PostgreSQL connection URL у Supabase

1. Відкрийте Supabase Dashboard.
2. Зайдіть у потрібний проєкт.
3. Перейдіть у `Project Settings` -> `Database`.
4. Відкрийте блок `Connection string`.
5. Для AWS Lambda/serverless краще обрати `Session pooler`, бо Lambda може створювати багато коротких підключень.
6. Скопіюйте URI у форматі:

```text
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

Для локальної розробки також можна використати `Direct connection`:

```text
postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

У скопійованому рядку замініть `<password>` на пароль бази даних. Його ви задавали під час створення Supabase проєкту. Якщо не пам'ятаєте пароль, у Supabase відкрийте `Project Settings` -> `Database` і скористайтесь reset database password.

## .env

Створіть `.env` у корені проєкту:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://postgres.project-ref:yourDatabasePassword@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
POSTGRES_SSL=true

JWT_ACCESS_SECRET=yourStrongAccessTokenSecret
ACCESS_TOKEN_EXPIRES_IN=1d
```

Змінні:

- `DATABASE_URL` - повний connection URL до PostgreSQL/Supabase. Береться в Supabase Dashboard у `Project Settings` -> `Database` -> `Connection string`.
- `POSTGRES_SSL` - для Supabase залишайте `true`. Для локальної PostgreSQL без SSL можна поставити `false`.
- `JWT_ACCESS_SECRET` - секрет для підпису access token. Задайте довгий випадковий рядок.
- `ACCESS_TOKEN_EXPIRES_IN` - строк життя access token, за замовчуванням `1d`.
- `PORT` - порт локального сервера, за замовчуванням `3000`.
- `NODE_ENV` - режим запуску.

MongoDB змінні більше не використовуються.

## Створення таблиць у Supabase

Перед запуском API потрібно створити таблиці. Відкрийте Supabase Dashboard -> `SQL Editor` -> `New query`, вставте SQL з файлу `src/database/schema.sql` і натисніть `Run`.

Схема створює:

- `users`
- `sessions`
- `news`
- `cars`
- потрібні індекси
- extension `pgcrypto` для `gen_random_uuid()`

## Запуск локально

Встановіть залежності:

```bash
npm install
```

Запустіть dev-сервер:

```bash
npm run dev
```

За замовчуванням API буде доступне на:

```text
http://localhost:3000
```

Swagger:

```text
http://localhost:3000/docs
```

OpenAPI JSON:

```text
http://localhost:3000/docs.json
```

## Приклади запитів

Реєстрація:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","nickname":"User"}'
```

Логін:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Створення новини:

```bash
curl -X POST http://localhost:3000/news \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id","type":"news","typeAccount":"freeUser","topic":"Release","text":"News text","files":[]}'
```

Отримання новин:

```bash
curl "http://localhost:3000/news?page=1&perPage=10&sortField=createdAt&sortOrder=desc"
```

Створення авто:

```bash
curl -X POST http://localhost:3000/cars \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id","make":"Toyota","model":"Camry","year":2020,"color":"black","price":22000,"mileage":45000,"vin":"jt2bf22k1w0123456","images":[]}'
```

## Деплой в AWS

Встановіть Serverless Framework, якщо він ще не встановлений:

```bash
npm install -g serverless
```

Налаштуйте AWS profile:

```bash
aws configure --profile yourProfileName
export AWS_PROFILE=yourProfileName
```

Перед деплоєм переконайтесь, що production environment variables доступні для Lambda:

- `DATABASE_URL`
- `POSTGRES_SSL=true`
- `JWT_ACCESS_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`

Поточний `serverless.yml` описує сервіс `aws-node-express-api`, runtime `nodejs22.x` і handler `dist/index.handler`.

Деплой:

```bash
npm run deploy
```

Команда `deploy` компілює TypeScript у `dist` і запускає `sls deploy`.

## Корисні команди

- `npm run dev` - локальний запуск через `nodemon` і `ts-node`.
- `npm run build` - компіляція TypeScript у `dist`.
- `npm start` - build і запуск `dist/index.js`.
- `npm run deploy` - build і деплой через Serverless Framework.

## Структура проєкту

```text
src/
  controllers/   HTTP controllers
  database/      PostgreSQL pool, SQL schema і TypeScript data types
  docs/          Swagger/OpenAPI конфіг
  helpers/       константи та допоміжні функції
  middlewares/   auth, logger, error handler
  routes/        Express routers
  services/      бізнес-логіка та SQL-запити
  utils/         env, pagination, query parsing
  validations/   celebrate/Joi schemas
```
