FROM node:20.11.1-alpine3.19 AS build
WORKDIR /app
COPY  . .
RUN npm ci && \
    npm run build

FROM node:20.11.1-alpine3.19 AS final
WORKDIR /app
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
USER node
CMD [ "node", "dist/src/main.js" ]