# 1. Prune the monorepo for @repo/worker
FROM node:20-alpine AS pruner
RUN npm i -g turbo
WORKDIR /app
COPY . .
RUN turbo prune --scope=@repo/worker --docker --out-dir=json-pruned


# 2. Base layer (includes build dependencies for native packages like SQLite/Sharp)
FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++
WORKDIR /app


# 3. Install ALL dependencies (using Turbo's pruned lockfile)
FROM base AS builder
# Copy ONLY pruned package.json and pruned package-lock.json
COPY --from=pruner /app/json-pruned/json/ .
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci


# 4. Dev Mode
FROM builder AS dev
RUN npm i -g turbo
COPY --from=pruner /app/json-pruned/full/ .
CMD ["turbo", "run", "dev", "--filter=@repo/worker"]


# 5. Copy source code and build worker
FROM builder AS compiled-builder
COPY --from=pruner /app/json-pruned/full/ .
RUN npx turbo run build --filter=@repo/worker


# 6. Production dependencies only stage
FROM base AS prod-installer
COPY --from=pruner /app/json-pruned/json/ .
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci --omit=dev


# 7. Final Production Runner Image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node

# Copy production node_modules and built app
COPY --chown=node:node --from=prod-installer /app ./
COPY --chown=node:node --from=compiled-builder /app/apps/worker/dist ./apps/worker/dist

CMD ["node", "apps/worker/dist/index.js"]