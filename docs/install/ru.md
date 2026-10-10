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

## Если что-то не работает

- **Ничего не появилось** — Проверьте, что URL совпадает с `*://*.tanktrouble.com/*` и скрипт включён, затем `Ctrl+F5`.
- **Панель исчезла** — Нажмите `Ctrl+Shift+L`. Позиция и свёрнутость запоминаются.
- **Всё ещё лагает** — Это ваша линия. Экспортируйте отчёт (`Ctrl+Shift+E`) и сравните регионы.

## Ссылки

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Русский](../README.ru.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
