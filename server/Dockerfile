# syntax=docker/dockerfile:1

ARG NODE_VERSION=23.11.0

# Development stage
FROM node:${NODE_VERSION}-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Production stage
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
