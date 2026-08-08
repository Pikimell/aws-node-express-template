# EventBridge Scheduler для Express API на AWS Lambda

Цей проєкт показує шаблон, у якому Express API створює розклади в AWS EventBridge Scheduler, а Scheduler у потрібний час викликає окрему callback Lambda з payload, який був переданий під час створення розкладу.

## Як це працює

Потік для одноразового нагадування:

1. Клієнт викликає `POST /schedules/once`.
2. Express Lambda створює EventBridge Scheduler schedule через AWS SDK.
3. Scheduler чекає до вказаного `runAt`.
4. Scheduler викликає callback Lambda.
5. Callback Lambda отримує переданий раніше `payload` і виводить його в CloudWatch Logs.
6. Одноразовий schedule автоматично видаляється після виконання через `ActionAfterCompletion: DELETE`.

Потік для повторюваного нагадування:

1. Клієнт викликає `POST /schedules/recurring`.
2. Express Lambda створює EventBridge Scheduler schedule з `rate(...)`, `cron(...)` або шаблонною частотою.
3. Scheduler викликає callback Lambda за розкладом.
4. Callback Lambda кожного разу отримує той самий `payload`.

## Що створює `serverless.yml`

`serverless.yml` описує такі ресурси:

- `api` Lambda - основна Express Lambda, яка приймає HTTP запити.
- `scheduleCallback` Lambda - окрема callback Lambda, яку викликає EventBridge Scheduler.
- `SchedulerInvokeLambdaRole` - IAM role, яку EventBridge Scheduler використовує для виклику callback Lambda.
- IAM permissions для `api` Lambda:
  - `scheduler:CreateSchedule` - дозволяє створювати schedules.
  - `iam:PassRole` - дозволяє передати `SchedulerInvokeLambdaRole` у target Scheduler.

Після деплою Serverless автоматично прокидає в `api` Lambda змінні:

```text
SCHEDULE_CALLBACK_LAMBDA_ARN
SCHEDULER_ROLE_ARN
```

Вони потрібні сервісу `src/services/scheduleService.ts`, щоб знати яку Lambda викликати і з якою IAM role.

## Основні файли

```text
serverless.yml
src/routes/schedules.ts
src/controllers/scheduleController.ts
src/services/scheduleService.ts
src/validations/schedule.ts
src/functions/scheduleCallback.ts
```

`src/functions/scheduleCallback.ts` зараз є шаблонною callback функцією:

```ts
export const handler = async (event: unknown) => {
  console.log("Scheduled callback payload:", JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Scheduled callback executed",
    }),
  };
};
```

Тут можна замінити `console.log` на реальну логіку: відправку email, push notification, webhook, запис у базу або будь-яку іншу дію.

## Endpoints

### Одноразовий виклик

```http
POST /schedules/once
```

Body:

```json
{
  "runAt": "2026-08-09T12:30:00Z",
  "payload": {
    "message": "Hello once"
  }
}
```

`runAt` має бути ISO date у майбутньому. Сервіс конвертує його у Scheduler expression:

```text
at(2026-08-09T12:30:00)
```

Приклад:

```bash
curl -X POST https://your-api-url/schedules/once \
  -H "Content-Type: application/json" \
  -d '{"runAt":"2026-08-09T12:30:00Z","payload":{"message":"Hello once"}}'
```

### Повторюваний виклик

```http
POST /schedules/recurring
```

Можна передати або `frequency`, або `expression`. Не можна передавати обидва одночасно.

Body з шаблонною частотою:

```json
{
  "frequency": "daily",
  "payload": {
    "message": "Hello daily"
  }
}
```

Дозволені значення `frequency`:

```text
daily
weekly
```

Вони перетворюються так:

```text
daily  -> rate(1 day)
weekly -> rate(1 week)
```

Body з власним Scheduler expression:

```json
{
  "expression": "rate(1 week)",
  "payload": {
    "message": "Hello weekly"
  }
}
```

Дозволені формати `expression`:

```text
rate(1 minute)
rate(5 minutes)
rate(1 hour)
rate(6 hours)
rate(1 day)
rate(3 days)
rate(1 week)
rate(2 weeks)
cron(0 12 ? * MON *)
```

Валідація дозволяє:

- `rate(...)` з одиницями `minute(s)`, `hour(s)`, `day(s)`, `week(s)`.
- `cron(...)` у форматі EventBridge Scheduler cron expression.

Приклад:

```bash
curl -X POST https://your-api-url/schedules/recurring \
  -H "Content-Type: application/json" \
  -d '{"expression":"cron(0 12 ? * MON *)","payload":{"message":"Every Monday at 12:00 UTC"}}'
```

## Налаштування AWS

Потрібні:

- AWS account.
- AWS CLI з налаштованим profile.
- Serverless Framework v4.
- Node.js 22 або сумісна версія.
- npm dependencies з `package-lock.json`.

Налаштування AWS profile:

```bash
aws configure --profile yourProfileName
export AWS_PROFILE=yourProfileName
```

Встановлення залежностей:

```bash
npm install
```

Деплой:

```bash
npm run deploy
```

`npm run deploy` запускає `npm run build`, а потім `sls deploy`.

## Що важливо знати

EventBridge Scheduler не викликає HTTP endpoint. Він викликає AWS target напряму. У цьому шаблоні target - це callback Lambda `scheduleCallback`.

Payload, який передається в endpoint, зберігається в schedule target як `Input`. Коли Scheduler викликає Lambda, цей JSON приходить у Lambda як `event`.

Одноразові schedules створюються з:

```ts
ActionAfterCompletion: "DELETE"
```

Тому після успішного одноразового виклику вони не залишаються в Scheduler.

Повторювані schedules не видаляються автоматично. Для production сценарію зазвичай потрібно додати окремі endpoints для:

- перегляду schedules;
- вимкнення schedule;
- видалення schedule;
- оновлення schedule;
- збереження schedule name у базі даних.

## Локальний запуск

Локально Express API можна запустити так:

```bash
npm run dev
```

API буде доступне на:

```text
http://localhost:3000
```

Але schedule endpoints створюють реальні AWS schedules. Для локальної перевірки цих endpoints потрібні:

- AWS credentials у середовищі;
- `SCHEDULE_CALLBACK_LAMBDA_ARN`;
- `SCHEDULER_ROLE_ARN`;
- вже задеплоєна callback Lambda.

Без цих значень локальний API не зможе створити schedule.

## Де налаштовувати під себе

Callback логіку змінювати тут:

```text
src/functions/scheduleCallback.ts
```

Валідацію request body змінювати тут:

```text
src/validations/schedule.ts
```

Створення Scheduler schedules змінювати тут:

```text
src/services/scheduleService.ts
```

IAM permissions, Lambda resources і environment variables змінювати тут:

```text
serverless.yml
```
