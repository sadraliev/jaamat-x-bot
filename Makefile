include .env
include .env.development.local

start:
	npm run build
	npm run start
dev:
	npm run start:dev
seed:
	npm run build
	npm run seed
set-webhook:
	curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${HOST_URL}"
get-webhook-info:
	curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"