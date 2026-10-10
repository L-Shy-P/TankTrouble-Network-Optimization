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

## أسئلة المبتدئين الشائعة (إذا لم تفهم، ابدأ من هنا)

- **هل هذه إضافة Chrome؟ هل أضيفها في chrome://extensions؟** — لا، هذا سكربت مستخدم. ثبّت Tampermonkey أولاً ثم ثبّت السكربت داخله. لا تستخدم «تحميل إضافة غير مضغوطة».
- **Tampermonkey يبدو مشبوهاً.** — هو أشهر مدير سكربتات مستخدم في Chrome/Edge/Firefox ويُثبّت من المتاجر الرسمية (tampermonkey.net). المشروع مفتوح المصدر على GitHub ولا يحتاج خادماً أو VPN أو إعداد شبكة.
- **حمّلت ZIP؛ هل أدخل المجلد كاملاً؟** — لا. اسحب ملف `tanktrouble-netlab.install.user.js` وحده إلى لوحة Tampermonkey. المجلد كاملاً ليس سكربتاً ولن يُثبّت.
- **كيف أفتح لوحة Tampermonkey؟** — اضغط أيقونة Tampermonkey في شريط المتصفح → لوحة التحكم. إن لم تظهر، اضغط زر الإضافات/القطع وثبّت Tampermonkey.
- **رابط raw يعرض الكود / Chrome يقول لا يمكن التثبيت من هذا الموقع.** — بعد تثبيت Tampermonkey افتح رابط raw وستظهر صفحة تثبيته. إن لم تظهر، انسخ الرابط واستخدم لوحة التحكم → الأدوات → التثبيت من URL.
- **أسحب الملف ولا يحدث شيء.** — أسقطه على صفحة لوحة Tampermonkey (وليس chrome://extensions أو صفحة عادية). إن كان السحب محظوراً استخدم رابط النقرة الواحدة أو «التثبيت من URL».
- **ثبّتته ولا أرى شيئاً في اللعبة.** — حدّث صفحة اللعبة بـ Ctrl+F5، وتأكد أن السكربت مفعّل في اللوحة، واضغط Ctrl+Shift+L لإظهار الواجهة. أي صفحة كانت مفتوحة قبل التثبيت يجب تحديثها.
- **هل أبقي ZIP/المجلد بعد التثبيت؟** — لا. السكربت أصبح داخل Tampermonkey؛ يمكنك حذف ZIP. التحديث من Tampermonkey أو بإعادة تثبيت رابط raw.
- **في Tampermonkey يوجد «استيراد من ملف»/«Add file» — هل أرفع الملف هناك؟** — لا، هذا الزر لملفات النسخ الاحتياطي `.zip` الخاصة بـ Tampermonkey. لتثبيت هذا السكربت استخدم لوحة التحكم → الأدوات → التثبيت من URL، أو اسحب ملف `.user.js` الواحد إلى اللوحة.
- **هل أغيّر الاسم أو أعدّل أو أفك ضغط `.user.js`؟** — لا، استخدم الملف كما هو. الملف نفسه هو نص السكربت؛ لا تضعه في `chrome://extensions` ولا ترفع المجلد كاملاً.
## حل المشكلات

- **لا يظهر شيء** — تأكد أن العنوان يطابق `*://*.tanktrouble.com/*` وأن السكربت مفعّل، ثم `Ctrl+F5`.
- **اختفت اللوحة** — اضغط `Ctrl+Shift+L`. يتم تذكّر الموضع وحالة الطيّ.
- **ما زال متقطعًا** — هذا خطّك أنت. صدّر تقريرًا (`Ctrl+Shift+E`) وقارن المناطق.

## روابط

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [العربية](../README.ar.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
