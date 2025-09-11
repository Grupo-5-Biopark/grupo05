# ---- Base Stage ----
FROM node:24.7.0-alpine AS base
WORKDIR /usr/src/app


# ---- Production Dependencies Stage ----
# Create a clean node_modules with only production dependencies
FROM base AS prod-deps
COPY package*.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
RUN npm ci --omit=dev --ignore-scripts


# ---- Build Stage ----
FROM base AS builder
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=server


# ---- Final Production Stage ----
FROM base AS production
ENV NODE_ENV production
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist/apps/server ./dist/apps/server
EXPOSE 3000
CMD [ "node", "dist/apps/server/main" ]