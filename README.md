# Playtomic Backend (Express + PostgreSQL)

---

## English

### Features
- Modular Express.js backend with PostgreSQL (Prisma ORM)
- Authentication (OTP, JWT, role-based)
- User, club, court, coach, booking, payment, wallet, notification, admin, analytics, gamification, matchmaking, messaging, export, and more
- Real integrations: Kavenegar (SMS), Zarinpal (payment), Firebase (push notifications)
- Rate limiting, audit logging, GDPR endpoints, CORS/Helmet security
- Swagger/OpenAPI docs for all endpoints
- Docker & docker-compose for easy deployment
- Export endpoints (CSV)
- Bilingual support (i18n ready)

### Setup
1. Install dependencies:
   ```sh
   npm install
   ```
2. Copy `.env.example` to `.env` and set your environment variables (see below).
3. Start the server:
   ```sh
   node src/server.js
   ```
4. Or use Docker Compose:
   ```sh
   docker-compose up --build
   ```

### Environment Variables
- `DATABASE_URL` (Postgres connection string)
- `PORT` (default: 3000)
- `JWT_SECRET` (set a strong secret)
- `KAVENEGAR_API_KEY` (for real SMS)
- `KAVENEGAR_SENDER` (optional, for SMS)
- `ZARINPAL_MERCHANT_ID` (for real payment)
- `ZARINPAL_CALLBACK_URL` (for payment verification)
- `GOOGLE_APPLICATION_CREDENTIALS` (for Firebase push notifications)

### Security & Compliance
- Rate limiting on auth/payment/general API
- Audit logging (see `src/logs/audit.log`)
- GDPR endpoints for data export/delete
- CORS/Helmet configured for best practices

### Integrations
- **SMS:** Kavenegar (fallback to mock if not set)
- **Payment:** Zarinpal (fallback to mock if not set)
- **Push:** Firebase Cloud Messaging (fallback to mock if not set)

### API Documentation
- Swagger UI: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Postman collection: (export via Swagger UI)

### Export/Reporting
- `/export/users` — Export users as CSV
- `/export/bookings` — Export bookings as CSV
- `/export/payments` — Export payments as CSV

### Docker & Deployment
- Use `docker-compose up --build` for local or production
- Prisma migrations: `docker-compose exec backend npx prisma migrate dev`

### Advanced Features
- Matchmaking, messaging, gamification (badges, leaderboard), admin panel, analytics, i18n-ready, and more

---

## فارسی (Persian)

### امکانات
- بک‌اند ماژولار با اکسپرس و پستگرس (Prisma ORM)
- احراز هویت (OTP، JWT، نقش‌ها)
- مدیریت کاربر، باشگاه، زمین، مربی، رزرو، پرداخت، کیف پول، نوتیفیکیشن، ادمین، آنالیتیکس، گیمیفیکیشن، مسابقه، پیام‌رسانی، خروجی اکسل و ...
- اتصال واقعی: کاوه‌نگار (SMS)، زرین‌پال (پرداخت)، Firebase (پوش)
- محدودیت نرخ، لاگ ممیزی، GDPR، امنیت CORS/Helmet
- مستندات Swagger/OpenAPI برای همه اندپوینت‌ها
- Docker و docker-compose برای راه‌اندازی آسان
- خروجی اکسل (CSV)
- پشتیبانی دوزبانه (آماده i18n)

### راه‌اندازی
1. نصب وابستگی‌ها:
   ```sh
   npm install
   ```
2. کپی `.env.example` به `.env` و تنظیم متغیرها (در پایین)
3. اجرای سرور:
   ```sh
   node src/server.js
   ```
4. یا با Docker Compose:
   ```sh
   docker-compose up --build
   ```

### متغیرهای محیطی
- `DATABASE_URL` (آدرس اتصال پستگرس)
- `PORT` (پیش‌فرض: 3000)
- `JWT_SECRET` (کلید امن)
- `KAVENEGAR_API_KEY` (برای SMS واقعی)
- `KAVENEGAR_SENDER` (اختیاری)
- `ZARINPAL_MERCHANT_ID` (برای پرداخت واقعی)
- `ZARINPAL_CALLBACK_URL` (برای تایید پرداخت)
- `GOOGLE_APPLICATION_CREDENTIALS` (برای پوش Firebase)

### امنیت و انطباق
- محدودیت نرخ روی auth/payment/API
- لاگ ممیزی (در `src/logs/audit.log`)
- اندپوینت‌های GDPR برای خروجی/حذف داده
- CORS/Helmet با تنظیمات امن

### یکپارچه‌سازی‌ها
- **SMS:** کاوه‌نگار (در صورت نبود، حالت تست)
- **پرداخت:** زرین‌پال (در صورت نبود، حالت تست)
- **پوش:** Firebase (در صورت نبود، حالت تست)

### مستندات API
- Swagger UI: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Postman collection: (قابل دریافت از Swagger UI)

### خروجی/گزارش‌گیری
- `/export/users` — خروجی کاربران (CSV)
- `/export/bookings` — خروجی رزروها (CSV)
- `/export/payments` — خروجی پرداخت‌ها (CSV)

### Docker و استقرار
- اجرای پروژه: `docker-compose up --build`
- مهاجرت Prisma: `docker-compose exec backend npx prisma migrate dev`

### امکانات پیشرفته
- مسابقه، پیام‌رسانی، گیمیفیکیشن (نشان، لیدربورد)، پنل ادمین، آنالیتیکس، آماده چندزبانه و ...

---
