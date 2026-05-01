FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json build.mjs ./
COPY src/ ./src/

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist

RUN mkdir -p /data

CMD ["node", "dist/index.js"]
