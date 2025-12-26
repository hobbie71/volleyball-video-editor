# syntax=docker/dockerfile:1

ARG NODE_VERSION=23.11.0

# Development stage
FROM node:${NODE_VERSION}-alpine AS development

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json* ./

# Copy all workspace packages
COPY shared ./shared
COPY server ./server

# Install dependencies for the entire workspace
RUN npm install

WORKDIR /app/server

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Production stage
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json* ./

# Copy all workspace packages
COPY shared ./shared
COPY server ./server

# Install production dependencies
RUN npm ci --only=production

WORKDIR /app/server
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
