# STAGE 1 - PRUNE LAYER
FROM node:20-alpine AS pruner
RUN npm i -g turbo
WORKDIR /app
COPY . .
RUN turbo prune --scope=@repo/worker --docker --out-dir=json-pruned


# STAGE 2 - BASE LAYER (includes build dependencies for native packages like SQLite/Sharp)
FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++
WORKDIR /app


# STAGE 3 - BUILDER LAYER (installing deps using Turbo's pruned lockfile)
FROM base AS builder
COPY --from=pruner /app/json-pruned/json/ .
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci


# STAGE 4 - DEV LAYER
FROM builder AS dev
RUN npm i -g turbo
COPY --from=pruner /app/json-pruned/full/ .
CMD ["turbo", "run", "dev", "--filter=@repo/worker"]


# STAGE 5 - COPY FULL SOURCE CODE AND BUILD THE WORKER AND THE DEPS IT IS USING (queue, utils)
FROM builder AS compiled-builder
COPY --from=pruner /app/json-pruned/full/ .
RUN npx turbo run build --filter=@repo/worker...


# STAGE 6 - PRODUCTION LAYER
FROM base AS prod-installer
COPY --from=pruner /app/json-pruned/json/ .
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci --omit=dev


# STAGE 7 - FINAL LAYER (That runs production image)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node

COPY --chown=node:node --from=prod-installer /app ./

COPY --chown=node:node --from=compiled-builder /app/apps ./apps
COPY --chown=node:node --from=compiled-builder /app/packages ./packages

CMD ["node", "apps/worker/dist/index.js"]