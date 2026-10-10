# Руководство по установке

> 🇷🇺 **TankTrouble — оптимизация сети** — Богаче, актуальнее и точнее: состояние сети плюс настоящая оптимизация.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · <b>🇷🇺 Русский</b> · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## Установка в один клик

[![Install](https://img.shields.io/badge/install-ru-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Нажмите кнопку (или откройте ссылку ниже) → Tampermonkey откроет страницу установки → нажмите **Установить**:

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Шаги

1. **Установите Tampermonkey**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo). Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/). «Добавить в браузер» → «Добавить расширение».

2. **Включите режим разработчика (Chrome/Edge)**

   Откройте `chrome://extensions` (или `edge://extensions`) и включите **Режим разработчика** справа вверху.

3. **Установите скрипт**

   Нажмите **Установить скрипт** ниже и подтвердите **Установить**.

4. **Откройте игру**

   Зайдите на <https://tanktrouble.com/game> и в бой: в левом верхнем углу появится шар, и можно сразу пользоваться.

## Горячие клавиши

| Key | |
|---|---|
| `Ctrl+Shift+S` | включить/выключить оптимизацию (живое A/B) |
| `Ctrl+Shift+L` | скрыть / показать HUD |
| `Ctrl+Shift+E` | экспорт диагностического отчёта (и в буфер обмена) |
| `Ctrl+Shift+P` | протестировать 7 регионов и построить рейтинг |

Кнопка **⚡** в панели делает то же, что `Ctrl+Shift+S`. В панели можно выбрать один из **10 языков**; язык, переключатель и позиция шара хранятся в `localStorage`.

## Если что-то не работает

- **Ничего не появилось** — Проверьте, что URL совпадает с `*://*.tanktrouble.com/*` и скрипт включён, затем `Ctrl+F5`.
- **Панель исчезла** — Нажмите `Ctrl+Shift+L`. Позиция и свёрнутость запоминаются.
- **Всё ещё лагает** — Это ваша линия. Экспортируйте отчёт (`Ctrl+Shift+E`) и сравните регионы.

## Ссылки

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Русский](../README.ru.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
