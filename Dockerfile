FROM node:24-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma/schema.prisma ./prisma/
RUN npm ci --omit=dev --no-audit --no-fund

COPY backend/prisma/migrations/ ./prisma/migrations/
COPY backend/dist/ ./dist/
COPY frontend/dist/ ./public/

ENV NODE_ENV=production FRONTEND_DIST=/app/public
USER node
CMD ["sh", "-c", "npm run db:deploy && exec node dist/server.js"]
