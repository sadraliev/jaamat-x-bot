.PHONY: build

include .env
include .env.development.local

build:
	npm run rimraf
	npm run build
start:
	npm run start
dev:
	npm run start:dev
set-webhook:
	curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${HOST_URL}"
get-webhook-info:
	curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"