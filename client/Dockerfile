# syntax=docker/dockerfile:1

ARG NODE_VERSION=23.11.0

FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

FROM base AS development

COPY package*.json ./

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev"]

FROM base AS production

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "5173"]