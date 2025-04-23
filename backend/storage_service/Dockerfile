# FROM node:20-alpine
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY tickets.json ./
# COPY . .
# CMD ["node", "index.js"]

FROM node:20-alpine

# Створюємо робочий каталог
WORKDIR /app

# Копіюємо package.json та package-lock.json (якщо є)
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо увесь код у контейнер
COPY . .

# Компілюємо TypeScript у JavaScript
RUN npm run build

COPY tickets.json ./dist

# Відкриваємо порт (той самий, що в app.listen)
EXPOSE 3000

# Запускаємо зкомпільований ESM-файл
CMD ["node", "dist/index.js"]
