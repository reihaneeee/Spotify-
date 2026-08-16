# Spotify Clone - Phase 2 (Backend & Frontend Integration)

این پروژه یک سرویس استریم موسیقی شبیه به Spotify است که در دو فاز پیاده‌سازی شده است. در فاز دوم، بک‌اند با Django و DRF پیاده‌سازی شده و فرانت‌اند با React و Vite به آن متصل می‌شود.

## ساختار پروژه

```
spotify-clone-project/
├── backend/            # بک‌اند (Django + DRF)
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── spotify_backend/
├── SpotifyApp/         # فرانت‌اند (React + Vite)
│   ├── package.json
│   ├── vite.config.js
│   └── src/
└── docker-compose.yml  # فایل داکر برای اجرای همزمان هر دو سرویس
```

---

## پیش‌نیازها

- **Python** >= 3.10 و **pip**
- **Node.js** >= 18 و **npm**
- **Docker** و **Docker Compose** (برای اجرای کانتینری)
- (اختیاری) **WSL 2** برای ویندوز (برای اجرای دستورات داکر در لینوکس)

---

## راه‌اندازی و اجرای پروژه

### ۱. بدون داکر (محلی)

#### الف) بک‌اند (Django)

```bash
cd backend

# ایجاد و فعال‌سازی محیط مجازی
python -m venv venv
source venv/bin/activate  # یا .\venv\Scripts\activate در ویندوز

# نصب وابستگی‌ها
pip install -r requirements.txt

# کپی کردن فایل محیطی و تنظیم متغیرها
cp .env.example .env
# (مقادیر را در .env تنظیم کنید)

# اجرای مایگریشن‌ها و مقداردهی اولیه
python manage.py migrate
python manage.py seed_subscription_plans
python manage.py createsuperuser  # برای ایجاد کاربر ادمین

# اجرای سرور
python manage.py runserver
```

بک‌اند روی `http://127.0.0.1:8000` در دسترس خواهد بود.

#### ب) فرانت‌اند (React)

```bash
cd SpotifyApp

# نصب وابستگی‌ها
npm install

# اجرای سرور توسعه
npm run dev
```

فرانت‌اند روی `http://localhost:5173` در دسترس خواهد بود.

### ۲. با داکر (توصیه‌شده برای تست نهایی)

این روش هر دو سرویس را با یک دستور بالا می‌آورد.

#### پیش‌نیاز

مطمئن شوید Docker Desktop فعال است (در ویندوز).

برای اجرای دستورات داکر، بهتر است از ترمینال WSL استفاده کنید، یا در PowerShell با دستور `docker context use default` تنظیمات را انجام دهید.

#### ساخت و اجرای کانتینرها

در ریشه‌ی پروژه (جایی که `docker-compose.yml` قرار دارد) دستور زیر را اجرا کنید:

```bash
docker-compose up -d --build
```

این دستور کارهای زیر را انجام می‌دهد:

- فایل‌های Dockerfile را برای بک‌اند و فرانت‌اند می‌سازد.
- وابستگی‌ها را نصب می‌کند.
- کانتینرها را در پس‌زمینه اجرا می‌کند.
- شبکه‌ای مشترک بین آن‌ها برقرار می‌کند.

#### اجرای مایگریشن‌ها و مقداردهی اولیه در داکر

پس از بالا آمدن کانتینرها، باید دیتابیس را آماده کنید:

```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_subscription_plans
docker-compose exec backend python manage.py createsuperuser  # برای ساخت ادمین
```

#### مشاهده لاگ‌ها و وضعیت

```bash
# مشاهده وضعیت کانتینرها
docker-compose ps

# مشاهده لاگ‌های هر دو سرویس (خروج با Ctrl+C)
docker-compose logs -f

# مشاهده لاگ‌های یک سرویس خاص (مثلاً backend یا frontend)
docker-compose logs backend
```

---

## دسترسی به سرویس‌ها

| سرویس | آدرس | توضیح |
|---|---|---|
| بک‌اند (Swagger) | http://localhost:8000/swagger/ | مستندات کامل API با قابلیت تست |
| بک‌اند (Admin) | http://localhost:8000/admin/ | پنل ادمین جنگو |
| فرانت‌اند | http://localhost:5173/ | رابط کاربری برنامه |

---

## دستورات مفید برای مدیریت داکر

| دستور | توضیح |
|---|---|
| `docker-compose up -d --build` | ساخت و اجرای کانتینرها در پس‌زمینه |
| `docker-compose down` | توقف و حذف کانتینرها |
| `docker-compose down -v` | توقف و حذف کانتینرها به همراه حجم‌های دیتابیس |
| `docker-compose restart` | ری‌استارت کانتینرها |
| `docker-compose exec backend python manage.py shell` | وارد شدن به شل جنگو در کانتینر بک‌اند |
| `docker-compose exec backend bash` | وارد شدن به ترمینال کانتینر بک‌اند |
| `docker-compose logs -f backend` | مشاهده لاگ‌های زنده بک‌اند |
