# SpotifyApp/Dockerfile
FROM node:20-alpine

# تنظیم پوشه کاری
WORKDIR /app

# کپی فایل‌های پکیج و نصب وابستگی‌ها
COPY package.json package-lock.json ./
RUN npm install

# کپی بقیه کدها
COPY . .

# ساخت پروژه برای تولید
RUN npm run build

# نصب سرور ساده برای ارائه فایل‌های استاتیک (برای تولید)
RUN npm install -g serve

# اجرای سرور روی پورت 5173
CMD ["serve", "-s", "dist", "-l", "5173"]