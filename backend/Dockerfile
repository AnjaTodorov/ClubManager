FROM node:24-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma/schema.prisma ./prisma/
RUN npm ci --omit=dev --no-audit --no-fund

COPY prisma/migrations/ ./prisma/migrations/
COPY dist/ ./dist/

ENV NODE_ENV=production
USER node
CMD ["sh", "-c", "npm run db:deploy && exec node dist/server.js"]
