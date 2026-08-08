# AWS Node Express Template

Node.js Express API для запуску в AWS Lambda через Serverless Framework.

Проєкт використовує один Lambda handler, який приймає HTTP API запити та передає їх у Express через `serverless-http`.

## Можливості

- Авторизація користувачів
- Робота з новинами
- Swagger документація
- Відправка email через AWS SES
- Запуск локально через Express
- Деплой в AWS Lambda через Serverless Framework

## Встановлення

Встановити залежності:

```bash
npm install
```

## Локальний запуск

Запустити API локально:

```bash
npm run dev
```

За замовчуванням сервер буде доступний за адресою:

```bash
http://localhost:3000
```

Swagger документація:

```bash
http://localhost:3000/docs
```

JSON Swagger схема:

```bash
http://localhost:3000/docs.json
```

## Налаштування AWS CLI

Налаштувати AWS profile:

```bash
aws configure --profile yourProfileName
```

Активувати profile для поточної terminal session:

```bash
export AWS_PROFILE=yourProfileName
```

Встановити Serverless Framework глобально, якщо він ще не встановлений:

```bash
npm install serverless -g
```

## Деплой

Перед деплоєм потрібно налаштувати всі необхідні env-змінні.

```bash
export AWS_PROFILE=yourProfileName
export SES_FROM_EMAIL=sender@example.com
```

Запустити деплой:

```bash
serverless deploy
```

Після успішного деплою Serverless покаже API URL. Його потрібно використовувати для HTTP запитів.

## AWS SES Email

Проєкт вміє відправляти email через AWS Simple Email Service.

Доступні сценарії:

- довільне notification повідомлення
- welcome email після успішної реєстрації
- notification про вхід в акаунт

## Що створює Serverless для SES

У `serverless.yml` налаштовано:

- env-змінну `SES_FROM_EMAIL` для Lambda
- IAM permission для `ses:SendEmail` та `ses:SendRawEmail`
- SES Email Identity для адреси з `SES_FROM_EMAIL`

`SES_FROM_EMAIL` має бути email адресою відправника.

## Як підтвердити SES Email Identity

Після деплою AWS SES відправить лист підтвердження на адресу з `SES_FROM_EMAIL`.

Щоб підтвердити адресу:

1. Відкрити поштову скриньку `SES_FROM_EMAIL`.
2. Знайти лист від AWS SES.
3. Натиснути verification link у листі.
4. Відкрити AWS Console.
5. Перейти в Amazon SES -> Configuration -> Verified identities.
6. Перевірити, що identity має статус `Verified`.

Якщо лист не прийшов, перевір spam або відправ verification email повторно з AWS Console.

## SES Sandbox

Нові AWS акаунти часто мають SES у sandbox mode.

У sandbox mode:

- email відправника має бути verified
- email отримувача також має бути verified
- не можна відправляти листи на будь-які зовнішні адреси без production access

Щоб відправляти листи на будь-які адреси, потрібно запросити production access:

```text
AWS Console -> Amazon SES -> Account dashboard -> Request production access
```

## Email Endpoint-и

У прикладах нижче `https://your-api-url` потрібно замінити на URL, який повернув `serverless deploy`.

### Відправити довільне повідомлення

```bash
curl -X POST https://your-api-url/email/notification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "message": "Ваше повідомлення"
  }'
```

### Відправити welcome email

```bash
curl -X POST https://your-api-url/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Відправити notification про вхід

```bash
curl -X POST https://your-api-url/email/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

Успішна відповідь:

```json
{
  "message": "Email sent successfully",
  "messageId": "010201..."
}
```

## Типові проблеми SES

- `Email address is not verified`: потрібно підтвердити `SES_FROM_EMAIL` в SES.
- `MessageRejected`: якщо SES у sandbox mode, потрібно підтвердити також email отримувача.
- `AccessDenied`: перевір `SES_FROM_EMAIL` і зроби redeploy, бо IAM permission створюється для конкретної identity.
- Verification email не приходить: перевір spam або resend verification у AWS Console.

## Корисні команди

TypeScript перевірка без build:

```bash
npx tsc --noEmit
```

Запуск production entry локально після build:

```bash
npm start
```
