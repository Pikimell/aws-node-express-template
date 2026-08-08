# AWS Node Express Template

TypeScript API на Express для запуску локально як звичайний HTTP-сервер і для деплою в AWS Lambda через Serverless Framework. Проєкт працює з MongoDB через Mongoose, має JWT-автентифікацію, HTTP-only cookie для токенів, сесії з refresh token, CRUD-операції для новин і Swagger-документацію.

## Що реалізовано

- Express API з TypeScript та ESM-модулями.
- Підключення до MongoDB Atlas через Mongoose.
- Реєстрація, логін, logout, refresh token і отримання поточного користувача.
- Хешування паролів через `bcryptjs`.
- Access token через JWT та refresh token у колекції `sessions`.
- HTTP-only cookie `accessToken` і `refreshToken`.
- Валідація запитів через `celebrate`/`Joi`.
- Колекція `news` з додаванням, отриманням списку та видаленням новин.
- Пагінація, сортування і фільтрація новин.
- Swagger UI на `/docs` і OpenAPI JSON на `/docs.json`.
- Обгортка `serverless-http` для запуску Express у AWS Lambda.
- `serverless.yml` з одним Lambda handler для всіх HTTP API route.

## Основні маршрути

### Auth

- `POST /auth/register` - реєстрація користувача.
- `POST /auth/login` - логін, створення сесії та встановлення cookie з токенами.
- `POST /auth/logout` - видалення refresh token сесії.
- `POST /auth/refresh` - ротація refresh token і видача нового access token.
- `GET /auth/me` - дані поточного користувача, потрібен Bearer access token.

### News

- `GET /news` - список новин.
- `POST /news` - створення новини.
- `DELETE /news/:newsId` - видалення новини за MongoDB ObjectId.

Параметри для `GET /news`:

- `page` - номер сторінки, за замовчуванням `1`.
- `perPage` - кількість елементів, за замовчуванням `10`, максимум `100`.
- `sortField` - `createdAt`, `updatedAt`, `topic`, `type` або `typeAccount`.
- `sortOrder` - `asc` або `desc`.
- `topic` - пошук по темі без урахування регістру.
- `type` - `updates`, `news`, `testimonials` або `video stories`.
- `typeAccount` - `freeUser`, `paidUser` або `agencyUser`.
- `userId` - фільтр за користувачем.

## Необхідні налаштування

Потрібні:

- Node.js 22 або сумісна версія.
- npm.
- MongoDB Atlas або інший MongoDB cluster з connection string у форматі `mongodb+srv`.
- Для деплою: AWS CLI, Serverless Framework v4 і налаштований AWS profile.

Створіть `.env` у корені проєкту:

```env
PORT=3000
NODE_ENV=development

MONGODB_USER=yourMongoUser
MONGODB_PASSWORD=yourMongoPassword
MONGODB_URL=your-cluster.mongodb.net
MONGODB_DB=yourDatabaseName

JWT_ACCESS_SECRET=yourStrongAccessTokenSecret
ACCESS_TOKEN_EXPIRES_IN=1d
```

`PORT`, `NODE_ENV` і `ACCESS_TOKEN_EXPIRES_IN` не є обов'язковими для старту, але їх варто задавати явно. MongoDB змінні та `JWT_ACCESS_SECRET` обов'язкові.

Підключення до MongoDB формується так:

```text
mongodb+srv://MONGODB_USER:MONGODB_PASSWORD@MONGODB_URL/MONGODB_DB?retryWrites=true&w=majority&ssl=true
```

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

Перед деплоєм переконайтесь, що production environment variables доступні для Lambda. Поточний `serverless.yml` описує сервіс `aws-node-express-api`, runtime `nodejs22.x` і handler `dist/index.handler`.

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
  database/      Mongoose models і MongoDB init middleware
  docs/          Swagger/OpenAPI конфіг
  helpers/       константи та допоміжні функції
  middlewares/   auth, logger, error handler
  routes/        Express routers
  services/      бізнес-логіка
  utils/         env, pagination, query parsing
  validations/   celebrate/Joi schemas
```
