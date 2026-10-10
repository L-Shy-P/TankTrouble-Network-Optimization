# Installationsanleitung

> 🇩🇪 **TankTrouble — Netzwerk-Optimierung** — Reichere, aktuellere und genauere Netzwerkanzeige — plus echte Optimierung.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · <b>🇩🇪 Deutsch</b> · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ Das ist ein Userscript, keine Browser-Erweiterung

Installiere zuerst **Tampermonkey** (Userscript-Manager). Nutze nicht „Entpackte Erweiterung laden“/die Chrome-Erweiterungsseite — die `.user.js`-Datei wird von Tampermonkey verwaltet, nicht als Erweiterung installiert.

## Methode A — Ein-Klick-Installation (empfohlen)

[![Install](https://img.shields.io/badge/install-de-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Nach der Tampermonkey-Installation auf den Badge klicken oder die URL unten öffnen: Tampermonkey öffnet die Installationsseite, dann **Installieren** klicken.

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Methode B — Installation aus der heruntergeladenen ZIP

1. **ZIP herunterladen**

   Auf der [GitHub-Seite](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) auf **Code → Download ZIP** klicken.
2. **Entpacken**

   ZIP in einen normalen Ordner entpacken.
3. **Tampermonkey installieren**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → Zu Chrome hinzufügen; dann `chrome://extensions` öffnen und **Entwicklermodus** aktivieren. Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → Zu Firefox hinzufügen.
4. **Userscript laden**

   Tampermonkey-Symbol in der Symbolleiste → **Dashboard**. `tanktrouble-netlab.install.user.js` aus dem Ordner auf die Seite ziehen und **Installieren** klicken.
5. **Spielseite neu laden**

   <https://tanktrouble.com/game> öffnen (neu laden, falls schon offen). Oben links erscheint die Kugel; anklicken, aufklappen und loslegen.

Wenn Ziehen nicht geht: den Ein-Klick-Link oben nutzen oder die Datei im Tampermonkey-Dashboard unter Dienstprogramme importieren. `tanktrouble-netlab.user.js` ist identisch; `install.user.js` ist die BOM-Kopie zum Ziehen.

## Tastenkürzel

| Key | |
|---|---|
| `Ctrl+Shift+S` | Optimierung ein-/ausschalten (Live-A/B) |
| `Ctrl+Shift+L` | HUD aus-/einblenden |
| `Ctrl+Shift+E` | Diagnosebericht exportieren (auch in die Zwischenablage) |
| `Ctrl+Shift+P` | alle 7 Regionen testen und ranken |

Der **⚡**-Button im Panel entspricht `Ctrl+Shift+S`. Im Panel gibt es **11 Sprachen**; Sprache, Schalter und Kugelposition werden in `localStorage` gespeichert.

## Fehlerbehebung

- **Nichts erscheint** — Prüfe, ob die URL zu `*://*.tanktrouble.com/*` passt und das Skript aktiv ist, dann `Ctrl+F5`.
- **Panel ist weg** — `Ctrl+Shift+L`. Position und eingeklappter Zustand werden gemerkt.
- **Immer noch ruckelig** — Das ist deine Leitung. Exportiere einen Bericht (`Ctrl+Shift+E`) und vergleiche Regionen.

## Links

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Deutsch](../README.de.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
