FROM node:24.20.0-bookworm-slim AS dependencies
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
COPY . .
RUN pnpm build

FROM node:24.20.0-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
COPY --from=builder /app ./
EXPOSE 3000
CMD ["pnpm", "start"]
