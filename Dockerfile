FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY .sequelizerc ./
COPY migrations ./migrations
COPY src ./src

EXPOSE 3000

CMD ["node", "src/index.js"]
