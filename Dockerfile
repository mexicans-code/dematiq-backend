FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY common/ ./common/
COPY gateway/package*.json ./gateway/
COPY services/auth/package*.json ./services/auth/
COPY services/users/package*.json ./services/users/
COPY services/products/package*.json ./services/products/
COPY services/orders/package*.json ./services/orders/

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
