# Crypto Wallet — Web3 кошелёк (MVP)

Мультичейн кошелёк для EVM-сетей с авторизацией через MetaMask, профилями, аватарками в S3 и управлением токенами.

---

## 🚀 Быстрый старт

```bash
git clone https://github.com/wnloved/crypto-flex.git
cd crypto-flex
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

