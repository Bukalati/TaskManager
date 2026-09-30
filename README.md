# 🚀 Task Management API

یک بک‌اند استاندارد و پرسرعت برای مدیریت کارها (Tasks) توسعه داده شده با **Next.js (App Router)**، **Bun**، **Supabase (PostgreSQL)** و اعتبارسنجی **Zod**.

---

## 📋 امکانات پیاده‌سازی شده

- [x] **عملیات کامل CRUD:**
  - `GET /api/tasks`: لیست تسک‌ها به همراه فیلتر، جستجو و صفحه‌بندی
  - `POST /api/tasks`: ایجاد تسک جدید با اعتبارسنجی ورودی
  - `GET /api/tasks/[id]`: دریافت جزئیات یک تسک با بررسی فرمت UUID
  - `PATCH /api/tasks/[id]`: ویرایش تسک (عنوان، توضیحات، وضعیت، اولویت، تاریخ سررسید) و به‌روزرسانی زمان `updated_at`
  - `DELETE /api/tasks/[id]`: حذف تسک با بررسی وضعیت وجود رکورد
- [x] **اعتبارسنجی قوی با Zod:** بررسی داده‌های ورودی، مقادیر پیش‌فرض (`TODO` و `MEDIUM`)، اعتبارسنجی تاریخ‌های ISO و بررسی صحت UUID.
- [x] **مدیریت خطای استاندارد و Status Codeها:**
  - `200 OK`: موفقیت در دریافت، ویرایش و حذف
  - `201 Created`: موفقیت در ساخت تسک
  - `400 Bad Request`: خطاهای اعتبارسنجی فرمت، ورودی‌های نامعتبر یا UUID نامعتبر
  - `404 Not Found`: در صورت پیدا نشدن تسک
  - `500 Internal Server Error`: خطاهای مربوط به عدم تنظیم کلیدها یا سرور
- [x] **فیلترینگ و صفحه‌بندی:**
  - فیلتر وضعیت: `?status=TODO | IN_PROGRESS | DONE`
  - فیلتر اولویت: `?priority=LOW | MEDIUM | HIGH`
  - جستجو: `?search=عنوان` (در عنوان و توضیحات)
  - صفحه‌بندی: `?page=1&limit=10`
  - مرتب‌سازی: `?sortBy=created_at&sortOrder=desc`
- [x] **تست‌های خودکار:** دارای ۱۱ تست جامع ولیدیشن اجرا شده با `bun test`.

---

## 🛠️ راه‌اندازی و اجرا

### ۱. تنظیم متغیرهای محیطی
فایل [`.env.local`](file:///.env.local) از قبل ایجاد شده است. کافیست مقادیر واقعی را از پنل Supabase خود در آن قرار دهید:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### ۲. اجرای سرور توسعه با Bun
```bash
bun run dev
```
سپس مرورگر یا Postman/Thunder Client را در آدرس `http://localhost:3000` باز کنید.

### ۳. اجرای تست‌ها
```bash
bun test
```

### ۴. بیلد پروداکشن
```bash
bun run build
bun run start
```

---

## 🗄️ اسکریپت تکمیلی دیتابیس (Supabase SQL Editor)

برای این که مقدار فیلد `updated_at` در سطح دیتابیس هم به صورت خودکار با هر تغییر به‌روزرسانی شود، این کوئری را در SQL Editor داشبورد Supabase خود اجرا کنید:

```sql
-- تابع به‌روزرسانی خودکار زمان
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تریگر جدول tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 📡 راهنمای فراخوانی APIها (Examples)

### ۱. ساخت تسک جدید
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "پیاده‌سازی بک‌اند",
  "description": "استفاده از Next.js و Zod و Supabase",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "due_date": "2026-10-15T18:00:00.000Z"
}
```

### ۲. دریافت لیست تسک‌ها با فیلتر و صفحه‌بندی
```http
GET /api/tasks?status=IN_PROGRESS&priority=HIGH&page=1&limit=10&sortBy=created_at&sortOrder=desc
```

### ۳. دریافت یک تسک با شناسه
```http
GET /api/tasks/8f1c84d7-4632-4751-bca8-e50eb1c85311
```

### ۴. ویرایش تسک
```http
PATCH /api/tasks/8f1c84d7-4632-4751-bca8-e50eb1c85311
Content-Type: application/json

{
  "status": "DONE"
}
```

### ۵. حذف تسک
```http
DELETE /api/tasks/8f1c84d7-4632-4751-bca8-e50eb1c85311
```
