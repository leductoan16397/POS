FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

RUN chown -R node:node /usr/src/app

COPY . .
RUN npm install -g pnpm

RUN pnpm install
