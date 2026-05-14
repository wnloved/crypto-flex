FROM node:22-alpine

WORKDIR /app

# Копируем только package.json сначала (для кэширования)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем остальной код (кроме node_modules)
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

EXPOSE 3000

# Запускаем в режиме разработки
CMD ["npm", "run", "start:dev"]