# Racks4L Beats

Самостоятельный BeatStore starter-проект: нативный HTML/CSS/ES Modules, Cloudflare Workers + D1, Supabase Storage.
Проект содержит рабочую основу каталога, плеера, сессий, заказов, админ API и SQL-схему. Перед коммерческим запуском настройте секреты, Telegram, Supabase, домен и пройдите checklist ниже.

## Требования
- Node.js 20+
- Wrangler CLI (`npm i -g wrangler`)
- Cloudflare аккаунт
- Supabase Storage project
- Telegram bot (для Telegram Login)

## Структура
- `frontend/` — storefront, каталог, custom player, account UI
- `admin/` — admin UI
- `backend/src/` — Worker REST API
- `migrations/` — D1 schema
- `tests/` — smoke tests
- `config/brand.js` — публичная конфигурация бренда

## Локальный запуск
1. `cd backend && npm install`
2. Создайте D1: `wrangler d1 create racks4l-dev`
3. В `backend/wrangler.toml` замените `database_id` на ID D1.
4. `wrangler d1 migrations apply racks4l --local`
5. Скопируйте `.dev.vars.example` в `.dev.vars`, заполните тестовые значения.
6. `npm run dev`
7. Откройте Worker URL `/` — Worker отдаёт API; для frontend используйте локальный статический сервер из корня: `npx serve frontend`.

## Production / Cloudflare
1. Создайте отдельные D1 для staging и production.
2. Выполните `wrangler d1 create racks4l-production` и внесите ID в `wrangler.toml`.
3. Примените миграции: `cd backend && npm run migrate:remote`.
4. Добавьте секреты через `wrangler secret put SESSION_SECRET`, `SUPABASE_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`.
5. Укажите `SUPABASE_URL`, `TELEGRAM_BOT_USERNAME`, `ADMIN_TELEGRAM_IDS` в Worker vars/secrets согласно таблице ниже.
6. Создайте Supabase buckets: `previews` (public), `covers` (public), `private-audio` (private), `stems` (private). Ограничьте MIME/размеры в Storage.
7. Подключите GitHub repo к Cloudflare Workers & Pages. Worker deploy: `cd backend && npm run deploy`.
8. Настройте Telegram Login domain в BotFather и укажите точный публичный домен.
9. Проверьте HTTPS, CORS origin, cookies, rate limits и все сценарии из checklist.

## Переменные
| Variable | Где | Назначение |
|---|---|---|
| `SUPABASE_URL` | Worker vars | URL Supabase проекта |
| `SUPABASE_SECRET_KEY` | Worker secret | Storage service key, только сервер |
| `TELEGRAM_BOT_TOKEN` | Worker secret | Проверка Telegram Login hash |
| `TELEGRAM_BOT_USERNAME` | Worker vars | Username бота без `@` |
| `SESSION_SECRET` | Worker secret | Секрет подписи/генерации сессий, минимум 32 случайных байта |
| `ADMIN_TELEGRAM_IDS` | Worker secret/var | Список Telegram ID через запятую |
| `PUBLIC_ORIGIN` | Worker var | Разрешённый frontend origin |
| `PAYMENT_INSTRUCTIONS` | Worker var | Инструкция ручной оплаты |
| `SUPABASE_BUCKET_PREVIEWS` | Worker var | По умолчанию previews |
| `SUPABASE_BUCKET_PRIVATE` | Worker var | По умолчанию private-audio |
| `SUPABASE_BUCKET_STEMS` | Worker var | По умолчанию stems |

## D1 backups
Настройте регулярный экспорт D1 через Cloudflare dashboard/API или scheduled workflow в отдельное защищённое хранилище. Перед восстановлением проверяйте целостность и делайте snapshot. Не храните backup в публичном репозитории.

## API (v1)
- `GET /api/v1/beats`
- `GET /api/v1/licenses`
- `GET /api/v1/me`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/telegram`
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `POST /api/v1/admin/orders/:id/confirm`
- `POST /api/v1/download/:purchaseId`

## Важные ограничения перед production
Этот архив — полноценная исходная кодовая база/рабочий starter, но не сертифицированный production deployment. До запуска обязательно: провести независимый security review, проверить Argon2id/WASM runtime compatibility, включить Turnstile или аналог против ботов, настроить email/Telegram recovery flow, rate limiting на уровне Cloudflare, CSP, мониторинг, backup/restore drill, реальные юридические тексты и платёжный процесс. Telegram Login требует корректного bot/domain setup. Оплата здесь ручная, без платёжного провайдера.
