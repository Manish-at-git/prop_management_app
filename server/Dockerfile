# Production Dockerfile
FROM node:20-bookworm AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build
RUN echo "=== DIST CONTENT ===" && find /app/dist -maxdepth 5 -type f

# Runner stage
FROM node:20-bookworm AS runner

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/src/main"]
