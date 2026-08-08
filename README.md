# AWS Node Express Template

Backend-шаблон на Node.js, Express і TypeScript для REST API з авторизацією через AWS Cognito, зберіганням даних у MongoDB та можливістю деплою в AWS Lambda через Serverless Framework.

## Що реалізовано

- Express API з TypeScript та ESM-модулями.
- Підключення до MongoDB через Mongoose.
- AWS Cognito авторизація:
  - реєстрація користувача;
  - підтвердження email кодом;
  - логін;
  - refresh token flow;
  - logout через Cognito GlobalSignOut;
  - запит на скидання пароля;
  - підтвердження нового пароля.
- HTTP-only cookies для `accessToken`, `refreshToken` і `sessionId`.
- Перевірка Cognito access token через `aws-jwt-verify`.
- Ролі користувачів через Cognito groups:
  - `user`;
  - `admin`.
- News API:
  - отримання списку новин;
  - створення новини тільки для `admin`;
  - видалення новини тільки для `admin`;
  - пагінація, сортування та фільтри.
- Валідація запитів через `celebrate` та `Joi`.
- Middleware для логування запитів, обробки помилок та авторизації.
- Serverless конфіг для AWS Lambda, HTTP API, Cognito User Pool, Cognito App Client та Cognito groups.

## Вимоги

- Node.js 22 або сумісна версія.
- npm.
- MongoDB Atlas або інший MongoDB сервер з connection string у форматі `mongodb+srv`.
- AWS акаунт для Cognito та деплою через Serverless.
- AWS CLI, якщо планується деплой.
- Serverless Framework v4, якщо планується деплой.

## Встановлення

```bash
npm install
```

## Environment variables

Для локального запуску створи файл `.env` у корені проєкту:

```env
PORT=3000
NODE_ENV=development

MONGODB_USER=your_mongodb_user
MONGODB_PASSWORD=your_mongodb_password
MONGODB_URL=your_cluster.mongodb.net
MONGODB_DB=your_database_name

COGNITO_USER_POOL_ID=your_cognito_user_pool_id
COGNITO_CLIENT_ID=your_cognito_app_client_id
```

Обов'язкові змінні:

- `MONGODB_USER` - користувач MongoDB.
- `MONGODB_PASSWORD` - пароль MongoDB.
- `MONGODB_URL` - адреса MongoDB cluster без протоколу, наприклад `cluster0.xxxxx.mongodb.net`.
- `MONGODB_DB` - назва бази даних.
- `COGNITO_USER_POOL_ID` - ID Cognito User Pool.
- `COGNITO_CLIENT_ID` - ID Cognito App Client.

`PORT` необов'язковий. Якщо його не вказати, локальний сервер стартує на `3000`.

## Локальний запуск

```bash
npm run dev
```

Сервер буде доступний за адресою:

```text
http://localhost:3000
```

У локальному режимі застосунок стартує як звичайний Express server. У production режимі експортується Lambda handler через `serverless-http`.

## Скрипти

- `npm run dev` - запускає локальний dev server через `nodemon` і `ts-node`.
- `npm run build` - компілює TypeScript у `dist`.
- `npm start` - компілює проєкт і запускає `dist/index.js`.
- `npm run deploy` - компілює проєкт і виконує `sls deploy`.

## API маршрути

### Auth

`POST /auth/register`

Реєструє користувача в Cognito, додає його в групу `user` та створює локальний запис у MongoDB.

```json
{
  "email": "user@example.com",
  "password": "Password1!"
}
```

`POST /auth/confirm`

Підтверджує email користувача кодом з Cognito.

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

`POST /auth/login`

Логінить користувача, встановлює auth cookies та повертає `accessToken`.

```json
{
  "email": "user@example.com",
  "password": "Password1!"
}
```

`POST /auth/refresh`

Оновлює сесію через refresh token. Refresh token береться з cookie або тіла запиту.

```json
{
  "refreshToken": "refresh_token"
}
```

`POST /auth/logout`

Завершує сесію користувача та очищає auth cookies.

`POST /auth/reset/request`

Надсилає email з кодом для скидання пароля.

```json
{
  "email": "user@example.com"
}
```

`POST /auth/reset/confirm`

Підтверджує скидання пароля.

```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewPassword1!"
}
```

### News

`GET /news`

Повертає список новин з пагінацією, сортуванням і фільтрами.

Підтримувані query params:

- `page` - номер сторінки.
- `perPage` - кількість елементів на сторінку, максимум `100`.
- `sortField` - `createdAt`, `topic`, `type`, `typeAccount`.
- `sortOrder` - `asc` або `desc`.
- `topic` - пошук по темі.
- `typeAccount` - `freeUser`, `paidUser`, `agencyUser`.
- `userId` - фільтр по користувачу.
- `type` - `updates`, `news`, `testimonials`, `video stories`.

Приклад:

```text
GET /news?page=1&perPage=10&sortField=createdAt&sortOrder=desc&type=news
```

`POST /news`

Створює новину. Доступно тільки користувачам з Cognito group `admin`.

Авторизація:

```text
Authorization: Bearer access_token
```

Тіло запиту:

```json
{
  "userId": "user-id",
  "type": "news",
  "typeAccount": "freeUser",
  "topic": "Тема новини",
  "text": "Текст новини",
  "files": ["https://example.com/file.png"]
}
```

`DELETE /news/:newsId`

Видаляє новину за MongoDB ObjectId. Доступно тільки користувачам з Cognito group `admin`.

## Налаштування AWS для деплою

1. Налаштуй AWS CLI профіль:

```bash
aws configure --profile yourProfileName
```

2. Активуй профіль у поточній shell-сесії:

```bash
export AWS_PROFILE=yourProfileName
```

3. Встанови Serverless Framework, якщо він ще не встановлений:

```bash
npm install -g serverless
```

4. Запусти деплой:

```bash
npm run deploy
```

Під час деплою Serverless створює:

- AWS Lambda function `api`;
- HTTP API endpoint;
- Cognito User Pool;
- Cognito User Pool Client;
- Cognito groups `user` та `admin`;
- IAM permissions для Cognito admin operations.

Після деплою у outputs будуть доступні:

- `CognitoUserPoolId`;
- `CognitoUserPoolClientId`.

Їх можна використовувати для локального `.env`.

## Важливі примітки

- Пароль має містити мінімум 8 символів, велику літеру, малу літеру, цифру та спеціальний символ.
- Нові користувачі автоматично додаються в Cognito group `user`.
- Admin-доступ до News API залежить від Cognito group `admin`.
- Cookies мають `httpOnly` і `sameSite=strict`; у production також вмикається `secure`.
- MongoDB підключається middleware-ом перед обробкою запиту і кешується для повторного використання.
