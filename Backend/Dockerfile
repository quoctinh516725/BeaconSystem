# syntax=docker/dockerfile:1.7
FROM node:20-alpine

WORKDIR /app

# Cài đặt openssl phục vụ cho Prisma Client
RUN apk add --no-cache openssl

# Copy file cấu hình package và cài đặt dependencies
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy toàn bộ mã nguồn
COPY . .

# Tạo Prisma Client
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

EXPOSE 3001

# Khởi chạy server
CMD ["npm", "run", "start"]
