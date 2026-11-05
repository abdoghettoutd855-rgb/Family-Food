# لوحة تحكم المطعم

## خطوات التشغيل

### 1) ربط قاعدة البيانات
افتح `assets/js/config.js` والصق بيانات مشروعك من Supabase:
- **Project Settings → API → Project URL**
- **Project Settings → API → anon public key**

### 2) تشغيل الموقع
- ارفع مجلد الموقع كاملاً على أي استضافة ثابتة (Netlify,GitHub Pages...)
- أو شغّله محلياً بسيرفر بسيط (مثال: `npx serve`)
- افتح `admin/index.html` للوحة التحكم

## بنية الملفات (مقسمة مثل الموقع)

```
admin/
├── index.html            # نظرة عامة (Dashboard)
├── menu.html             # محرر القائمة
├── orders.html           # الطلبات
├── export.html           # تصدير القائمة PDF
├── billing.html          # الاشتراك والفواتير
├── settings.html         # إعدادات المطعم
└── assets/
    ├── css/
    │   └── admin.css     # كل التنسيقات
    └── js/
        ├── config.js     # مفاتيح Supabase
        ├── db.js         # الاستعلامات (Supabase)
        ├── ui.js         # أدوات مشتركة (تنبيهات، نوافذ...)
        ├── dashboard.js  # منطق صفحة نظرة عامة
        ├── menu.js       # منطق محرر القائمة
        ├── orders.js     # منطق الطلبات
        ├── export.js     # منطق التصدير
        ├── settings.js   # منطق الإعدادات
        └── billing.js    # منطق الفواتير
```

## ملاحظات
- الألوان والخطوط مطابقة تماماً لالموقع (الذهبي #e4c590 + Forum/DM Sans)
- اللوحة تعمل بالعربية (RTL) وتتصل بجداول Supabase التي أنشأناها:
  categories, menu_items, orders, order_items, customers...


## تحديث قائمة الأطباق الجزائرية

يوجد ملف `database/algerian-menu-migration.sql` لتحديث أصناف القائمة التجريبية القديمة في جدول `public.menu_items` إذا كانت ما تزال موجودة.
افتح Supabase → SQL Editor وشغّل الملف مرة واحدة فقط. الأسعار الحالية في الملف أولية بالدينار الجزائري ويجب اعتمادها أو تعديلها مع صاحب المطعم قبل النشر.
