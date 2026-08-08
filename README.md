# AWS Node Express Template

TypeScript API на Express для запуску локально як звичайний HTTP-сервер і для деплою в AWS Lambda через Serverless Framework. Проєкт працює із Supabase через `@supabase/supabase-js`: сервер звертається до таблиць Supabase SDK-запитами, без прямого PostgreSQL connection URL у коді.

## Що реалізовано

- Express API з TypeScript та ESM-модулями.
- Підключення до Supabase через `@supabase/supabase-js`.
- Реєстрація, логін, logout, refresh token і отримання поточного користувача.
- Хешування паролів через `bcryptjs`.
- Access token через JWT та refresh token у таблиці `sessions`.
- HTTP-only cookie `accessToken` і `refreshToken`.
- Валідація запитів через `celebrate`/`Joi`.
- CRUD для `news` і `cars`.
- Пагінація, сортування і фільтрація списків через Supabase SDK.
- Статистика авто рахується у сервісі на основі даних, отриманих із Supabase.
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
- Supabase проєкт.
- Для деплою: AWS CLI, Serverless Framework v4 і налаштований AWS profile.

## Як взяти Supabase змінні

1. Відкрийте Supabase Dashboard.
2. Зайдіть у потрібний проєкт.
3. Перейдіть у `Project Settings` -> `API`.
4. Скопіюйте `Project URL` - це значення для `SUPABASE_URL`.
5. У цьому ж розділі відкрийте `Project API keys`.
6. Скопіюйте `service_role` key - це значення для `SUPABASE_SERVICE_ROLE_KEY`.

`SUPABASE_SERVICE_ROLE_KEY` має повний серверний доступ і обходить RLS. Зберігайте його тільки в backend `.env` або serverless secrets. Не додавайте його у frontend, мобільний застосунок, публічний репозиторій або Swagger приклади.

## .env

Створіть `.env` у корені проєкту:

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=yourSupabaseServiceRoleKey

JWT_ACCESS_SECRET=yourStrongAccessTokenSecret
ACCESS_TOKEN_EXPIRES_IN=1d
```

Змінні:

- `SUPABASE_URL` - URL Supabase проєкту. Береться в `Project Settings` -> `API` -> `Project URL`.
- `SUPABASE_SERVICE_ROLE_KEY` - серверний ключ Supabase. Береться в `Project Settings` -> `API` -> `Project API keys` -> `service_role`.
- `JWT_ACCESS_SECRET` - секрет для підпису access token. Задайте довгий випадковий рядок.
- `ACCESS_TOKEN_EXPIRES_IN` - строк життя access token, за замовчуванням `1d`.
- `PORT` - порт локального сервера, за замовчуванням `3000`.
- `NODE_ENV` - режим запуску.

`DATABASE_URL`, `POSTGRES_SSL` і MongoDB змінні більше не використовуються.

## Створення таблиць у Supabase

Перед запуском API потрібно створити таблиці. Відкрийте Supabase Dashboard -> `SQL Editor` -> `New query`, вставте SQL з файлу `src/database/schema.sql` і натисніть `Run`.

Схема створює:

- `users`
- `sessions`
- `news`
- `cars`
- потрібні індекси
- extension `pgcrypto` для `gen_random_uuid()`

Після цього сервер працює з цими таблицями через Supabase SDK. Окремий PostgreSQL connection string для застосунку не потрібен.

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

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
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
  database/      Supabase client, SQL schema і TypeScript data types
  docs/          Swagger/OpenAPI конфіг
  helpers/       константи та допоміжні функції
  middlewares/   auth, logger, error handler
  routes/        Express routers
  services/      бізнес-логіка та Supabase SDK-запити
  utils/         env, pagination, query parsing
  validations/   celebrate/Joi schemas
```
