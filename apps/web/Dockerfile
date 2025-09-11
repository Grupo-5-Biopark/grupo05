# ---- Base Stage ----
FROM node:24.7.0-alpine AS base
WORKDIR /usr/src/app


# ---- Production Dependencies Stage ----
FROM base AS prod-deps
COPY package*.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
RUN npm ci --omit=dev --ignore-scripts


# ---- Build Stage ----
FROM base AS builder
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=web


# ---- Final Production Stage ----
FROM base AS production
ENV NODE_ENV production
COPY --from=builder /usr/src/app/apps/web/.next ./apps/web/.next
COPY --from=builder /usr/src/app/apps/web/public ./apps/web/public
COPY --from=builder /usr/src/app/apps/web/package.json ./apps/web/
COPY --from=builder /usr/src/app/package.json ./
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
EXPOSE 3001
CMD ["npm", "start", "--workspace=web"]