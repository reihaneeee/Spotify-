# backend/Dockerfile
FROM python:3.12-slim

# نصب وابستگی‌های سیستمی ضروری برای کتابخانه‌های پایتون
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# تنظیم پوشه کاری
WORKDIR /app

# کپی فایل وابستگی‌ها و نصب آن‌ها
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# کپی بقیه کدها
COPY . .

# تنظیم متغیر محیطی برای اجرای جنگو (در حالت تولید باید از گانکورن استفاده کنید)
ENV PYTHONUNBUFFERED=1

# اجرای سرور (برای تولید بهتر است از Gunicorn استفاده شود اما برای تست، runserver کافی است)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]