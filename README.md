# AWS Node Express Template

TypeScript API на Express для запуску локально як звичайний HTTP-сервер і для деплою в AWS Lambda через Serverless Framework. Проєкт виконує запити до OpenAI ChatGPT API і не використовує авторизацію або базу даних.

## Що реалізовано

- Express API з TypeScript та ESM-модулями.
- POST endpoint для OpenAI Chat Completions.
- Валідація body для OpenAI запитів через `celebrate`/`Joi`.
- Health endpoint для перевірки стану сервера.
- Swagger UI на `/docs` і OpenAPI JSON на `/docs.json`.
- Обгортка `serverless-http` для запуску Express у AWS Lambda.
- `serverless.yml` з одним Lambda handler для всіх HTTP API route.

## Основні маршрути

- `GET /health` - перевірка стану API.
- `POST /openai/chat/completions` - запит до OpenAI ChatGPT API.

## OpenAI Request Body

`POST /openai/chat/completions` приймає JSON body:

- `model` - обов'язковий рядок з назвою моделі.
- `messages` - обов'язковий непорожній масив повідомлень.
- `messages[].role` - `system`, `developer`, `user` або `assistant`.
- `messages[].content` - обов'язковий непорожній текст.
- `temperature` - необов'язкове число від `0` до `2`.
- `maxTokens` - необов'язкове ціле число більше `0`.

Підтримувані моделі для цього endpoint:

```text
gpt-5.1
gpt-5
gpt-5-mini
gpt-5-nano
gpt-5-chat-latest
gpt-4.1
gpt-4.1-mini
gpt-4.1-nano
o4-mini
o3
o3-mini
o1
o1-mini
o1-preview
gpt-4o
gpt-4o-mini
gpt-4-turbo
gpt-4
gpt-3.5-turbo
```

Можливі помилки:

- `400` - body не пройшов `celebrate` валідацію: немає `model` або `messages`, неправильний `role`, порожній `content`, некоректний `temperature` чи `maxTokens`.
- `401` - `OPENAI_API_KEY` відсутній або недійсний.
- `429` - перевищено rate limit або квоту OpenAI.
- `500` - неочікувана помилка сервера або OpenAI API.

## Необхідні налаштування

Потрібні:

- Node.js 22 або сумісна версія.
- npm.
- Для деплою: AWS CLI, Serverless Framework v4 і налаштований AWS profile.

Створіть `.env` у корені проєкту:

```env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=yourOpenAiApiKey
```

`OPENAI_API_KEY` обов'язковий для запитів до OpenAI. `PORT` і `NODE_ENV` не є обов'язковими для старту, але їх можна задавати явно.

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

Health check:

```bash
curl "http://localhost:3000/health"
```

OpenAI ChatGPT запит:

```bash
curl -X POST "http://localhost:3000/openai/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "system",
        "content": "Ти корисний асистент."
      },
      {
        "role": "user",
        "content": "Поясни, що таке Express middleware."
      }
    ],
    "temperature": 0.7,
    "maxTokens": 500
  }'
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
  docs/          Swagger/OpenAPI конфіг
  helpers/       допоміжні функції
  middlewares/   logger, error handler
  routes/        Express routers
  services/      OpenAI SDK integration
  utils/         env helpers
  validations/   celebrate/Joi schemas
```
