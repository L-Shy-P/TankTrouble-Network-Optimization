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

## Einsteiger-FAQ (wenn du verwirrt bist, lies das)

- **Ist das eine Chrome-Erweiterung? Muss ich sie in chrome://extensions hinzufügen?** — Nein, es ist ein Userscript. Installiere zuerst Tampermonkey und dann das Script darin. „Entpackte Erweiterung laden“ wird nicht benutzt.
- **Tampermonkey sieht unseriös aus.** — Tampermonkey ist der verbreitetste Userscript-Manager für Chrome/Edge/Firefox und kommt aus den offiziellen Stores (tampermonkey.net). Das Projekt ist Open Source auf GitHub; Server, VPN oder Netzwerkeinstellungen sind nicht nötig.
- **Ich habe die ZIP geladen — soll ich den ganzen Ordner hineinziehen?** — Nein. Ziehe nur die Datei `tanktrouble-netlab.install.user.js` in das Tampermonkey-Dashboard. Ein Ordner ist kein Script und wird nicht installiert.
- **Wie öffne ich das Tampermonkey-Dashboard?** — Auf das Tampermonkey-Symbol in der Symbolleiste klicken → Dashboard. Wenn du es nicht siehst, klicke auf die Puzzle-/Erweiterungen-Schaltfläche und pinne Tampermonkey an.
- **Der Raw-Link zeigt Code / Chrome sagt, von dieser Seite kann nicht installiert werden.** — Mit Tampermonkey geöffnet zeigt der Raw-Link dessen Installationsseite. Falls nicht, URL kopieren und Dashboard → Dienstprogramme → Von URL installieren verwenden.
- **Ich ziehe die Datei hinein, nichts passiert.** — Sie muss auf die Tampermonkey-Dashboard-Seite gezogen werden (nicht chrome://extensions oder eine normale Webseite). Wenn Drag-and-drop blockiert ist, Ein-Klick-Link oder „Von URL installieren“ nutzen.
- **Installiert, aber im Spiel erscheint nichts.** — Spielseite mit Ctrl+F5 neu laden, im Dashboard prüfen, ob das Script aktiv ist, und Ctrl+Shift+L für das HUD drücken. Eine vor der Installation offene Seite muss neu geladen werden.
- **ZIP/Ordner nach der Installation behalten?** — Nein. Das Script liegt jetzt in Tampermonkey; die ZIP kann gelöscht werden. Updates über Tampermonkey oder erneutes Installieren des Raw-Links.

## Fehlerbehebung

- **Nichts erscheint** — Prüfe, ob die URL zu `*://*.tanktrouble.com/*` passt und das Skript aktiv ist, dann `Ctrl+F5`.
- **Panel ist weg** — `Ctrl+Shift+L`. Position und eingeklappter Zustand werden gemerkt.
- **Immer noch ruckelig** — Das ist deine Leitung. Exportiere einen Bericht (`Ctrl+Shift+E`) und vergleiche Regionen.

## Links

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Deutsch](../README.de.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
