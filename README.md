# أعمالي

موقع أعمال ثنائي اللغة. العربية هي اللغة الافتراضية، والإنجليزية من زر اللغة. الواجهة بـ Next.js، والبيانات في Supabase.

## إنشاء مشروع Supabase

1. أنشئ مشروعًا جديدًا في Supabase.
2. من SQL Editor شغّل `supabase/migrations/0001_init.sql`.
3. ثم شغّل `supabase/seed.sql`.

## إيقاف التسجيل العام

من لوحة Supabase: Authentication → Providers → Email → عطّل Sign ups.

أنشئ المستخدم يدويًا من Authentication → Users، وأكّد البريد من اللوحة. لا توجد واجهة تسجيل في الموقع.

## المستخدم الوحيد

انسخ UUID من Authentication → Users، ثم نفّذ:

```sql
insert into public.owner (user_id) values ('PUT-USER-UUID-HERE');
```

استبدل `PUT-USER-UUID-HERE` بالمعرّف. التطبيق لا يزرع جدول `owner`.

## دلو الصور

الهجرة تنشئ الدلو `project-shots` إن لم يكن موجودًا: عام، الحد 5MB، والأنواع png وjpeg وwebp. القراءة عامة. الكتابة للمالك فقط عبر `public.is_owner()`.

إن لم يُنشأ الدلو، أنشئه من Storage بنفس الحد والأنواع، ثم أضف سياسات `storage.objects` كما هي في ملف الهجرة.

## التشغيل المحلي

```bash
npm install
```

انسخ `.env.example` إلى `.env.local` وضع:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

ثم:

```bash
npm run dev
```

## النشر على Vercel

أضف المتغيرين في إعدادات المشروع، واربط مستودع GitHub ليعمل النشر تلقائيًا عند الدفع.

## نطاق مخصص

من Vercel: Settings → Domains → أضف النطاق، ثم انقل سجلات DNS التي تعرضها Vercel إلى المسجّل.

## الأمان

لا يوجد مفتاح service role في التطبيق. الكتابة تتم بجلسة المالك وRLS فقط.
