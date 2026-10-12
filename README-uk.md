# AWS Node Express Template

> Production-oriented шаблон автентифікованого TypeScript API для локального запуску або AWS Lambda.

Шаблон поєднує Express, TypeScript, ESM, MongoDB/Mongoose, JWT, HTTP-only cookies, refresh-token sessions, валідацію, CRUD, Swagger/OpenAPI та Serverless Framework.

## Можливості

- Реєстрація, логін, logout, refresh-token rotation та endpoint поточного користувача.
- CRUD новин із пагінацією, сортуванням і фільтрацією.
- Валідація через `celebrate`/`Joi`.
- Swagger UI на `/docs` та OpenAPI JSON на `/docs.json`.
- Локальний HTTP-сервер і AWS Lambda handler через `serverless-http`.

## Вимоги та запуск

Потрібні Node.js 22, npm, MongoDB, а для деплою — AWS CLI та Serverless Framework.

```bash
npm install
npm run dev
```

API: `http://localhost:3000` · Swagger: `http://localhost:3000/docs`.

Для AWS налаштуйте profile і виконайте `npm run deploy`. Англійська версія за замовчуванням: [README.md](README.md).
