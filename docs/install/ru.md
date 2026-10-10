# Руководство по установке

> 🇷🇺 **TankTrouble — оптимизация сети** — Богаче, актуальнее и точнее: состояние сети плюс настоящая оптимизация.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · <b>🇷🇺 Русский</b> · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ Это userscript, а не расширение браузера

Сначала установите менеджер userscript'ов **Tampermonkey**. Не используйте «Загрузить распакованное расширение»/страницу расширений Chrome — файлом `.user.js` управляет Tampermonkey.

## Способ A — установка в один клик (рекомендуется)

[![Install](https://img.shields.io/badge/install-ru-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

После установки Tampermonkey нажмите бейдж или откройте URL ниже: Tampermonkey откроет страницу установки, нажмите **Установить**.

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Способ B — установка из скачанного ZIP

1. **Скачайте ZIP**

   На [странице GitHub](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) нажмите **Code → Download ZIP**.
2. **Распакуйте**

   Распакуйте ZIP в обычную папку.
3. **Установите Tampermonkey**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → Добавить в Chrome; затем откройте `chrome://extensions` и включите **Режим разработчика**. Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → Добавить в Firefox.
4. **Загрузите userscript**

   Нажмите значок Tampermonkey на панели → **Панель управления**. Перетащите `tanktrouble-netlab.install.user.js` из папки на страницу панели и нажмите **Установить**.
5. **Обновите страницу игры**

   Откройте <https://tanktrouble.com/game> (обновите, если уже открыто). Слева вверху появится шар; нажмите на него, чтобы раскрыть, и пользуйтесь.

Если перетаскивание не сработало: используйте ссылку в один клик выше или импортируйте файл через «Утилиты» в панели Tampermonkey. `tanktrouble-netlab.user.js` — то же содержимое; `install.user.js` — копия с BOM для перетаскивания.

## Горячие клавиши

| Key | |
|---|---|
| `Ctrl+Shift+S` | включить/выключить оптимизацию (живое A/B) |
| `Ctrl+Shift+L` | скрыть / показать HUD |
| `Ctrl+Shift+E` | экспорт диагностического отчёта (и в буфер обмена) |
| `Ctrl+Shift+P` | протестировать 7 регионов и построить рейтинг |

Кнопка **⚡** в панели делает то же, что `Ctrl+Shift+S`. В панели можно выбрать один из **11 языков**; язык, переключатель и позиция шара хранятся в `localStorage`.

## FAQ для новичков (если запутались — сюда)

- **Это расширение Chrome? Добавлять в chrome://extensions?** — Нет, это userscript. Сначала установите Tampermonkey, а скрипт ставьте внутри него. «Загрузить распакованное расширение» не используется.
- **Tampermonkey выглядит подозрительно.** — Это самый популярный менеджер userscript'ов для Chrome/Edge/Firefox, ставится из официальных магазинов (tampermonkey.net). Проект открыт на GitHub, сервер/VPN/настройка сети не нужны.
- **Скачал ZIP — перетаскивать всю папку?** — Нет. Перетащите только файл `tanktrouble-netlab.install.user.js` в панель Tampermonkey. Целая папка не является скриптом и не установится.
- **Как открыть панель Tampermonkey?** — Нажмите значок Tampermonkey на панели браузера → Панель управления. Если значка нет — кнопка пазла/расширений, закрепите Tampermonkey.
- **По raw-ссылке открывается код / Chrome пишет, что нельзя установить с этого сайта.** — С установленным Tampermonkey откройте raw-ссылку — Tampermonkey покажет свою страницу установки. Если нет — скопируйте URL и используйте Панель → Утилиты → Установить из URL.
- **Перетаскиваю файл, ничего не происходит.** — Бросать нужно на страницу панели Tampermonkey (не chrome://extensions и не обычную страницу). Если блокируется — ссылка в один клик или «Установить из URL».
- **Установил, но в игре ничего нет.** — Обновите страницу игры Ctrl+F5, проверьте, что скрипт включён в панели, нажмите Ctrl+Shift+L для HUD. Страницу, открытую до установки, нужно обновить.
- **Оставлять ZIP/папку после установки?** — Нет. Скрипт уже в Tampermonkey; ZIP можно удалить. Обновление — через Tampermonkey или повторную установку raw-ссылки.
- **В Tampermonkey есть «Импорт из файла»/«Add file» — туда загружать?** — Нет, эта кнопка для резервных `.zip` Tampermonkey. Для установки скрипта используйте Панель → Утилиты → Установить из URL или перетащите один файл `.user.js` в панель.
- **Нужно переименовывать, редактировать или распаковывать `.user.js`?** — Нет, используйте файл как есть. Это и есть текст скрипта. Не кладите его в `chrome://extensions` и не загружайте целую папку.
## Если что-то не работает

- **Ничего не появилось** — Проверьте, что URL совпадает с `*://*.tanktrouble.com/*` и скрипт включён, затем `Ctrl+F5`.
- **Панель исчезла** — Нажмите `Ctrl+Shift+L`. Позиция и свёрнутость запоминаются.
- **Всё ещё лагает** — Это ваша линия. Экспортируйте отчёт (`Ctrl+Shift+E`) и сравните регионы.

## Ссылки

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Русский](../README.ru.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
