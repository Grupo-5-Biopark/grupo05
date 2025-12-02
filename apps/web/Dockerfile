# ---- Base Stage ----
FROM node:24.7.0-alpine AS base
WORKDIR /usr/src/app

# ---- Dependencies Stage ----
FROM base AS deps
COPY package*.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
RUN npm ci --ignore-scripts

# ---- Build Stage ----
FROM base AS builder
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
WORKDIR /usr/src/app/apps/web
RUN npm run build

# ---- Production Stage ----
FROM node:24.7.0-alpine AS production
WORKDIR /app

# Install production dependencies
COPY --from=builder /usr/src/app/apps/web/package.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built application
COPY --from=builder /usr/src/app/apps/web/.next ./.next
COPY --from=builder /usr/src/app/apps/web/public ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
