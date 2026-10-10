# Installationsanleitung

> 🇩🇪 **TankTrouble — Netzwerk-Optimierung** — Reichere, aktuellere und genauere Netzwerkanzeige — plus echte Optimierung.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · <b>🇩🇪 Deutsch</b> · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## Installation mit einem Klick

[![Install](https://img.shields.io/badge/install-de-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Klicke den Badge (oder öffne die URL unten) → Tampermonkey öffnet die Installationsseite → **Installieren**:

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Schritte

1. **Tampermonkey installieren**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo). Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/). „Zum Browser hinzufügen“ → „Erweiterung hinzufügen“.

2. **Entwicklermodus aktivieren (nur Chrome/Edge)**

   Öffne `chrome://extensions` (oder `edge://extensions`) und aktiviere **Entwicklermodus** oben rechts.

3. **Skript installieren**

   Klicke unten auf **Skript installieren** und dann **Installieren**.

4. **Spiel öffnen**

   Gehe auf <https://tanktrouble.com/game> und starte eine Runde: Die Kugel erscheint oben links, und du kannst sofort loslegen.

## Tastenkürzel

| Key | |
|---|---|
| `Ctrl+Shift+S` | Optimierung ein-/ausschalten (Live-A/B) |
| `Ctrl+Shift+L` | HUD aus-/einblenden |
| `Ctrl+Shift+E` | Diagnosebericht exportieren (auch in die Zwischenablage) |
| `Ctrl+Shift+P` | alle 7 Regionen testen und ranken |

Der **⚡**-Button im Panel entspricht `Ctrl+Shift+S`. Im Panel gibt es **10 Sprachen**; Sprache, Schalter und Kugelposition werden in `localStorage` gespeichert.

## Fehlerbehebung

- **Nichts erscheint** — Prüfe, ob die URL zu `*://*.tanktrouble.com/*` passt und das Skript aktiv ist, dann `Ctrl+F5`.
- **Panel ist weg** — `Ctrl+Shift+L`. Position und eingeklappter Zustand werden gemerkt.
- **Immer noch ruckelig** — Das ist deine Leitung. Exportiere einen Bericht (`Ctrl+Shift+E`) und vergleiche Regionen.

## Links

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Deutsch](../README.de.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
