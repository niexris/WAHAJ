# وهج | WAHAJ — المرحلة 1

أساس المشروع: Next.js 14 (App Router) + TypeScript + Tailwind + Supabase، واجهة عربية RTL، تسجيل دخول المالك برمز OTP، وحماية لوحة التحكم.

## ما تم في هذه المرحلة
- هيكل المشروع والهوية (كحلي / ذهبي / أبيض) وخط Tajawal.
- تسجيل دخول المالك: بريد ← رمز OTP ← لوحة التحكم.
- حماية `/admin` في ثلاث طبقات: Middleware، وفحص جدول `admins` في الـ Layout، وسياسات RLS في قاعدة البيانات.
- لوحة رئيسية تقرأ عدّادات حقيقية من القاعدة (تظهر أصفارًا حتى تضيف بيانات).
- تسجيل الخروج.

## ما لم يُنفَّذ بعد
إدارة البازارات والبوثات والمتاجر (المرحلة 2)، التقييمات وQR وتتبع الزوار (المرحلة 3)، الرسوم البيانية والتقارير والتصدير (المرحلة 4). عناصر القائمة لتلك الأقسام معطّلة وعليها وسم «قريبًا».

## حالة الاختبار
كُتب الكود وفُحصت صياغته (Syntax) فقط. **لم يُنفَّذ** `npm install` ولا `npm run build`، ولم يُختبر الاتصال بـ Supabase ولا إرسال OTP، لأن بيئة الكتابة بلا إنترنت. اتبع الخطوات أدناه، وأرسل لي أي خطأ يظهر لإصلاحه.

## الإعداد خطوة بخطوة

### 1) المتطلبات
Node.js 18.18 أو أحدث، وحساب في supabase.com.

### 2) تثبيت الحزم
```bash
npm install
npm run typecheck
```

### 3) إنشاء مشروع Supabase وتنفيذ المخطط
1. أنشئ مشروعًا جديدًا.
2. افتح **SQL Editor** وانسخ محتوى `supabase/wahaj_schema.sql` ثم **Run**.

### 4) إعدادات المصادقة (Authentication)
1. **Providers → Email**: فعّله.
2. **أوقف التسجيل الذاتي**: Authentication → Sign In / Providers → عطّل *Allow new users to sign up*.
3. **مدة الرمز**: اجعل *Email OTP Expiration* = `600` (10 دقائق)، وطول الرمز 6.
4. **قالب الرسالة**: Authentication → Email Templates → **Magic Link**، وأضف الرمز إلى النص:
   ```html
   <h2>رمز الدخول إلى وهج</h2>
   <p>{{ .Token }}</p>
   ```
5. **البريد في الإنتاج**: خدمة البريد الافتراضية في Supabase محدودة جدًا. اضبط **SMTP مخصص** (مثل Resend أو SendGrid) من Project Settings → Authentication → SMTP.
6. **حدود المحاولات**: Authentication → Rate Limits. هذه الحدود هي التي تمنع تكرار المحاولات على مستوى الخادم.

### 5) إنشاء حساب المالك
1. Authentication → Users → **Add user** → أدخل بريدك وفعّل *Auto Confirm User* → انسخ الـ UUID.
2. في SQL Editor:
```sql
insert into admins (id, full_name, contact)
values ('ضع-الـUUID-هنا', 'اسم المالك', 'owner@example.com');
```
من دون هذا السطر لن يدخل الحساب لوحة التحكم حتى لو نجح الرمز.

### 6) متغيرات البيئة
```bash
cp .env.example .env.local
```
املأ القيمتين من Project Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

مفتاح `service_role` غير مستخدم في هذه المرحلة. لا تضعه في أي ملف يبدأ اسمه بـ `NEXT_PUBLIC_`.

### 7) التشغيل
```bash
npm run dev
```
افتح http://localhost:3000/login ثم سجّل الدخول.

## النشر على Vercel
1. ارفع المشروع إلى GitHub (ملف `.env.local` مُستثنى تلقائيًا).
2. في Vercel: Import Project، وأضف متغيري البيئة أعلاه.
3. بعد النشر: في Supabase → Authentication → URL Configuration ضع رابط موقعك في *Site URL*.
4. بعد تثبيت الحزم نفّذ `npm audit` وحدّث Next.js إلى آخر إصدار 14.2.x.

## الهيكل
```
src/
  middleware.ts            حماية /admin وتجديد الجلسة
  app/
    page.tsx               الصفحة العامة
    login/                 تسجيل الدخول (OTP)
    auth/signout/          تسجيل الخروج
    admin/                 لوحة التحكم (layout محمي + الرئيسية)
  components/
    brand/  admin/
  lib/
    supabase/              client / server / middleware
    auth.ts                التحقق من المالك
supabase/wahaj_schema.sql  مخطط قاعدة البيانات (دون تغيير)
```

## ملاحظة على المخطط
عُدِّل سطر صلاحيات الدالة `analytics_summary` فقط: سُحبت الصلاحية من `public` و`anon` ومُنحت لـ `authenticated`، مع تحديد أنواع المعاملات صراحةً. بقية المخطط دون تغيير.
