# دليل التثبيت

> 🇸🇦 **TankTrouble — تحسين الشبكة** — عرض أغنى وأكثر لحظية ودقة لحالة الشبكة، مع تحسين حقيقي.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · <b>🇸🇦 العربية</b> · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## التثبيت بنقرة واحدة

[![Install](https://img.shields.io/badge/install-ar-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

اضغط الشارة (أو افتح الرابط بالأسفل) → سيفتح Tampermonkey صفحة التثبيت → اضغط **تثبيت**:

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## الخطوات

1. **ثبّت Tampermonkey**

   كروم/إيدج: [متجر كروم](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo). فايرفوكس: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/). ثم «إضافة إلى المتصفح».

2. **فعّل وضع المطور (كروم/إيدج فقط)**

   افتح `chrome://extensions` وفعّل **وضع المطوّر** في الأعلى.

3. **ثبّت السكربت**

   اضغط **تثبيت السكربت** بالأسفل ثم **تثبيت**.

4. **افتح اللعبة**

   اذهب إلى <https://tanktrouble.com/game> وادخل مباراة: ستظهر الكرة أعلى اليسار ويمكنك البدء بالاستخدام مباشرة.

## اختصارات لوحة المفاتيح

| Key | |
|---|---|
| `Ctrl+Shift+S` | تشغيل/إيقاف تحسين الشبكة (مقارنة فورية) |
| `Ctrl+Shift+L` | إخفاء / إظهار الواجهة |
| `Ctrl+Shift+E` | تصدير تقرير التشخيص (ويُنسخ أيضًا) |
| `Ctrl+Shift+P` | فحص 7 مناطق وترتيبها |

زر **⚡** في اللوحة يعمل مثل `Ctrl+Shift+S`. ويمكنك اختيار واحدة من **10 لغات**؛ تُحفظ اللغة والمفتاح وموضع الكرة في `localStorage`.

## حل المشكلات

- **لا يظهر شيء** — تأكد أن العنوان يطابق `*://*.tanktrouble.com/*` وأن السكربت مفعّل، ثم `Ctrl+F5`.
- **اختفت اللوحة** — اضغط `Ctrl+Shift+L`. يتم تذكّر الموضع وحالة الطيّ.
- **ما زال متقطعًا** — هذا خطّك أنت. صدّر تقريرًا (`Ctrl+Shift+E`) وقارن المناطق.

## روابط

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [العربية](../README.ar.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
