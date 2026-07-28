# STAGE 1
FROM node:20-alpine AS pruner
RUN npm i -g turbo
WORKDIR /app
COPY . .
RUN turbo prune --scope=@repo/server --docker --out-dir=json-pruned

# STAGE 2
FROM node:20-alpine AS base
WORKDIR /monorepo
RUN apk add --no-cache python3 make g++

# STAGE 3
FROM base AS builder
COPY --from=pruner /app/json-pruned/json/ .
COPY package-lock.json package.json ./
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci  

# STAGE 4
FROM builder AS dev
RUN npm i -g turbo
COPY --from=pruner /app/json-pruned/full/ .
EXPOSE 3000
CMD ["turbo", "run", "dev", "--filter=@repo/server"]

# STAGE 5
FROM base AS compiled-builder
COPY --from=pruner /app/json-pruned/full/ .
RUN npm --filter=@repo/server run build

# STAGE 6
FROM base AS prod-installer
COPY --from=pruner /app/json-pruned/json/ .
COPY package-lock.json package.json ./
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci

# STAGE 7
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

RUN mkdir -p /usr/src/app/data && chown -R node:node /usr/src/app

USER node

COPY --chown=node:node --from=prod-installer /monorepo ./
COPY --chown=node:node --from=compiled-builder /monorepo/apps/server/dist ./apps/server/dist

ENV DATABASE_URL=/usr/src/app/data/test.db

EXPOSE 3000
CMD ["node", "apps/server/dist/server.js"]
