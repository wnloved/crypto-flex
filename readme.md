# Crypto Wallet — Web3 кошелёк (MVP)

Мультичейн кошелёк для EVM-сетей с авторизацией через MetaMask, профилями, аватарками в S3 и управлением токенами.

---

## 🚀 Быстрый старт

```bash
git clone https://github.com/wnloved/crypto-flex.git
cd crypto-flex-server
```
Создай .env файл [см. раздел .env](#переменные-окружения)
```
docker-compose up -d
```
### Frontend: http://localhost:5173

### Backend API: http://localhost:3000

---

## 📦 Стек технологий

|Компонент|Технология|
|---------|----------|
|Frontend|React, Vite, Tailwind, ethers.js|
|Backend|	NestJS, Prisma, PostgreSQL, Redis|
|Auth|	MetaMask, JWT, nonce подпись|
|Хранилище|	S3 (Cloud.ru)|
|Контейнеризация|	Docker, Docker Compose||

## ✅ Что реализовано

* Авторизация через MetaMask (одноразовая подпись + JWT)

* Мультичейн для EVM-сетей: Ethereum, Sepolia, Polygon, BSC

* Управление токенами (балансы, поиск, добавление по адресу)

* Профиль пользователя (username, bio)

* Аватарки с загрузкой в S3 (Drag & Drop)

* Контакты (сохранение адресов с никами)

* История транзакций

* Кэширование балансов и цен через Redis

* Полная докеризация (одна команда для запуска)

## 🔧 Переменные окружения

Создай файл `crypto-flex-server/.env`:

Пример .env файла (все поля обязательны)

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/crypto_db"
JWT_SECRET="8v4ghjjhkUzJVPeNVklk;klXxAU2BgHcLiYbAuaOrDqX" // SET YOUR JWT KEY
REDIS_URL="redis://redis:6379"
ETHERSCAN="SB2YKCZS86KYQBJFWEJ43QSYCF9DXG" //SET YOUR ETHERSCAN API KEY
S3_REGION="ru-central-3"  //https://cloud.ru
S3_ACCESS_KEY_ID="9be5732a7336fsdfdFe1c6b8791"
S3_BUCKET="e4nnfsd590-c0d6-4fa6-960e-11a4bd57dbf8"
S3_SECRET_KEY="12f4348a4gsd23j4h23l01d3e859b83a12"
LOGOKIT="pk_frf23432432223050df7e536" //https://logokit.com/
```

## 🛠 Что можно доработать (roadmap)
Поддержка не-EVM сетей (Bitcoin, Solana)

WebSocket для обновлений в реальном времени

Swagger документация API

Админ-панель для управления токенами и сетями

Мобильное приложение (React Native)

Unit / e2e тесты

## 📝 Лицензия
MIT

## 👤 Автор
[wnloved](https://github.com/wnloved)

### ⭐️ P.S.
Это не просто пет-проект. Это рабочий продукт, который можно показать, запустить и развивать дальше.
