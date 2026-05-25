FROM node:24 AS builder

ARG NPM_CONFIG_USERCONFIG
ARG NPM_TOKEN

WORKDIR /app
COPY .npmrc.ci package*.json pnpm-lock.yaml ./
COPY discord-db ./discord-db
COPY db ./db

RUN yarn global add pnpm
RUN pnpm config set side-effects-cache false

RUN pnpm install --no-verify-store-integrity --ignore-scripts
RUN pnpm prisma

COPY . .
RUN pnpm build

FROM node:24

RUN yarn global add pnpm

LABEL org.opencontainers.image.source=https://github.com/puff-social/discord-bot

WORKDIR /app

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/dist dist
COPY --from=builder /app/generated generated
COPY --from=builder /app/package.json ./

ENTRYPOINT ["node", "dist/"]
