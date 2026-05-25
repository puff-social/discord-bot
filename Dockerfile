FROM oven/bun:latest

RUN apt update
RUN apt install curl -y

ARG NPM_CONFIG_USERCONFIG
ARG NPM_TOKEN

WORKDIR /app
COPY .npmrc.ci .bunfig.toml package*.json bun.lock ./
COPY discord-db ./discord-db
COPY db ./db

RUN cp .npmrc.ci .npmrc
RUN bun install

RUN mkdir -p node_modules/node_extra_ca_certs_mozilla_bundle/ca_bundle/ && \
    curl -L https://curl.se/ca/cacert.pem -o node_modules/node_extra_ca_certs_mozilla_bundle/ca_bundle/ca_intermediate_root_bundle.pem

RUN bun run prisma

COPY . .

ENTRYPOINT ["bun", "run", "src"]
