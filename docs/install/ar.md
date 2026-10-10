# دليل التثبيت

> 🇸🇦 **TankTrouble — تحسين الشبكة** — عرض أغنى وأكثر لحظية ودقة لحالة الشبكة، مع تحسين حقيقي.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · <b>🇸🇦 العربية</b> · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ هذا سكربت مستخدم وليس إضافة متصفح

ثبّت أولاً مدير السكربتات **Tampermonkey**. لا تستخدم «تحميل إضافة غير مضغوطة»/صفحة الإضافات في Chrome — ملف `.user.js` يديره Tampermonkey وليس إضافة.

## الطريقة أ — تثبيت بنقرة واحدة (مُستحسن)

[![Install](https://img.shields.io/badge/install-ar-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

بعد تثبيت Tampermonkey اضغط الشارة أو افتح الرابط أدناه؛ سيفتح Tampermonkey صفحة التثبيت، ثم اضغط **تثبيت**.

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## الطريقة ب — التثبيت من ملف ZIP الذي حمّلته

1. **نزّل ملف ZIP**

   في [صفحة GitHub](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) اضغط **Code → Download ZIP**.
2. **فك الضغط**

   فُك ضغط ZIP إلى مجلد عادي.
3. **ثبّت Tampermonkey**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → إضافة إلى Chrome؛ ثم افتح `chrome://extensions` وفعّل **وضع المطوّر**. Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → إضافة إلى Firefox.
4. **حمّل السكربت**

   افتح Tampermonkey من شريط الأدوات → **لوحة التحكم**. اسحب `tanktrouble-netlab.install.user.js` من المجلد إلى صفحة اللوحة، ثم اضغط **تثبيت**.
5. **حدّث صفحة اللعبة**

   افتح <https://tanktrouble.com/game> (حدّث الصفحة إن كانت مفتوحة). ستظهر الكرة في الأعلى يساراً؛ اضغط عليها للفتح وابدأ الاستخدام.

إذا لم يعمل السحب: استخدم رابط النقرة الواحدة أعلاه أو استورد الملف من قسم الأدوات في لوحة Tampermonkey. ملف `tanktrouble-netlab.user.js` بنفس المحتوى؛ و`install.user.js` نسخة BOM للسحب.

## اختصارات لوحة المفاتيح

| Key | |
|---|---|
| `Ctrl+Shift+S` | تشغيل/إيقاف تحسين الشبكة (مقارنة فورية) |
| `Ctrl+Shift+L` | إخفاء / إظهار الواجهة |
| `Ctrl+Shift+E` | تصدير تقرير التشخيص (ويُنسخ أيضًا) |
| `Ctrl+Shift+P` | فحص 7 مناطق وترتيبها |

زر **⚡** في اللوحة يعمل مثل `Ctrl+Shift+S`. ويمكنك اختيار واحدة من **11 لغات**؛ تُحفظ اللغة والمفتاح وموضع الكرة في `localStorage`.

## حل المشكلات

- **لا يظهر شيء** — تأكد أن العنوان يطابق `*://*.tanktrouble.com/*` وأن السكربت مفعّل، ثم `Ctrl+F5`.
- **اختفت اللوحة** — اضغط `Ctrl+Shift+L`. يتم تذكّر الموضع وحالة الطيّ.
- **ما زال متقطعًا** — هذا خطّك أنت. صدّر تقريرًا (`Ctrl+Shift+E`) وقارن المناطق.

## روابط

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [العربية](../README.ar.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
