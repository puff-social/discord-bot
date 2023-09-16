FROM node:18 AS builder

ARG NPM_CONFIG_USERCONFIG
ARG NPM_TOKEN

WORKDIR /app
COPY prisma .npmrc.ci package*.json pnpm-lock.yaml ./

RUN yarn global add pnpm
RUN pnpm install

COPY . .
RUN yarn build

FROM node:18

RUN yarn global add pnpm

LABEL org.opencontainers.image.source=https://github.com/puff-social/discord-bot

WORKDIR /app

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/dist dist
COPY --from=builder /app/package.json ./

ENTRYPOINT pnpm start