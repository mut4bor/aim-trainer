FROM node:24-alpine

WORKDIR /app

RUN apk update && apk add bash
COPY package*.json ./
RUN npm ci

COPY . .

ENTRYPOINT ["bash", "entrypoint.sh"]
