# 🇩🇪 TankTrouble — Netzwerk-Optimierung

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · <b>🇩🇪 Deutsch</b> · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

<img src="img/v053/panel-de.png" width="440" alt="panel"> <img src="img/v053/ball-de.png" width="150" alt="floating ball">

> Reichere, aktuellere und genauere Netzwerkanzeige — plus echte Optimierung.

Ein Tampermonkey-Userscript für **tanktrouble.com**. Es zeigt, was deine Verbindung wirklich macht, und verwandelt „Hänger → Teleport“ durch TCP-Head-of-Line-Blocking in ein weiches Gleiten.

**Kein Server, keine Netzwerkkonfiguration, kein VPN.** Rein clientseitig: der Server sieht exakt dieselben Bytes.

Die Optimierung ändert nur *das, was du siehst*: die Position wird im Moment des Renderns geglättet, während Logik, Physik und Serverprüfung immer die echten Werte nutzen. Dein Panzer ist lokal autoritativ — nach einem Reconnect wirst du nicht zurückgezogen.

## Installation mit einem Klick · Features

| | |
|---|---|
| Reicher | Leitung / Ø / aktuell / Maximum / Jitter / Hänger / Stabilität live |
| Aktueller | eigene Ping-Sonde alle 2 s: echte RTT statt Frame-Abstände |
| Genauer | echte Hänger (Head-of-Line) werden von Lobby-Pausen getrennt |
| Optimierung | Rendering-Glättung + lokale Autorität + Dead Reckoning, mit A/B-Schalter |

## ⚠️ Das ist ein Userscript, keine Browser-Erweiterung

Installiere zuerst **Tampermonkey** (Userscript-Manager). Nutze **nicht** `chrome://extensions` / „Entpackte Erweiterung laden“ — die `.user.js`-Datei wird von Tampermonkey verwaltet, nicht als Erweiterung installiert. Wenn eine Seite voller Code erscheint, bist du am falschen Einstieg — komm zu dieser Anleitung zurück.

## Methode A — ziehe die heruntergeladene Datei in das Tampermonkey-Dashboard (empfohlen, am einfachsten)

### Schritt 1 (nur einmal) — Tampermonkey installieren

Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) öffnen → **Zu Chrome hinzufügen**. Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) öffnen → **Zu Firefox hinzufügen**.

Wenn nach der Installation kein Tampermonkey-Symbol in der Symbolleiste zu sehen ist: klicke oben rechts auf die Schaltfläche **Puzzle / Erweiterungen** und **pinne** Tampermonkey.

### Schritt 2 — die Skriptdatei herunterladen

Klicke auf **[⬇ Download](https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js)** (oder öffne den Link unten): Der Browser speichert die Datei im Ordner **„Downloads“** unter dem Namen `tanktrouble-netlab.install.user.js`.

**Nicht umbenennen, nicht entpacken, nicht bearbeiten** — es ist ein reiner Text-Script.

```
https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js
```

### Schritt 3 — das Tampermonkey-**Dashboard** öffnen (hier hängen die meisten fest)

Klicke in der Browser-Symbolleiste auf das **Tampermonkey-Symbol** → im Menü auf **Dashboard** (deutsch: **Übersicht**).

- Symbol nicht gefunden: Klicke auf **Puzzle / Erweiterungen** und dann auf Tampermonkey.
- ⚠️ Der Menüpunkt „**Neues Skript hinzufügen**“ öffnet den **Editor**, nicht den Installations-Einstieg. Nutze das **Dashboard** (in der chinesischen Oberfläche „管理面板“).
- Wenn du schon auf einer anderen Tampermonkey-Seite bist, klicke links in der Seitenleiste auf **Installed scripts / Installierte Skripte**, um zur Liste zurückzukommen.

### Schritt 4 — die Datei hineinziehen

Lass die **Dashboard-Listenseite** geöffnet und ziehe `tanktrouble-netlab.install.user.js` aus dem Ordner **„Downloads“ auf die Dashboard-Seite** → die Installationsseite von Tampermonkey erscheint (dunkle Seite mit Skriptname "TankTrouble Network Optimization", Version und **Install**-Button) → klicke auf **Install**.

- Wenn Ziehen nicht funktioniert: **Dashboard → Utilities / Dienstprogramme → Install from URL**, denselben Download-Link einfügen und **Install** klicken.
- Du kannst auch direkt den Ein-Klick-Link anklicken (unten als **Methode B** behalten): Mit installiertem Tampermonkey öffnet sich sofort die Installationsseite. Wenn stattdessen eine Seite voller Code beginnend mit `// ==UserScript==` erscheint, hat Tampermonkey den Klick nicht bekommen → zurück zum Ziehen oben.

### Schritt 5 — ins Spiel gehen

Öffne <https://tanktrouble.com/game> → lade mit **Ctrl + F5** hart neu → oben links erscheint das Panel oder die schwebende Kugel. Wenn nicht, drücke **Ctrl + Shift + L** — vielleicht ist es ausgeblendet.

## Methode B — Ein-Klick-Installation (Tampermonkey bereits installiert)

[![Install](https://img.shields.io/badge/install-de-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Wenn Tampermonkey schon installiert ist, klicke den Badge (oder den Link unten): Tampermonkey öffnet sofort seine eigene Installationsseite — eine dunkle Seite mit Skriptname "TankTrouble Network Optimization", Version und **Install**-Button; erst nach dem Klick auf **Install** ist das Skript installiert. Wenn du eine Seite voller Code beginnend mit `// ==UserScript==` siehst, hat der Klick Tampermonkey nicht erreicht → zurück zu **Methode A** (Ziehen).

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Methode C — Installation aus der heruntergeladenen ZIP (offline)

Wenn du schon per Ziehen installieren kannst, **reicht Methode A — du brauchst die ZIP nicht**. Nutze die ZIP nur, wenn du das ganze Repository offline behalten willst.

1. **ZIP herunterladen**

   Auf der [GitHub-Seite](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) auf **Code → Download ZIP** klicken.
2. **Entpacken**

   ZIP in einen normalen Ordner entpacken.
3. **Prüfen, ob Tampermonkey installiert ist**

   Falls nicht, zurück zu Methode A, Schritt 1. `chrome://extensions` nicht verwenden.
4. **Userscript laden**

   Tampermonkey-Symbol → **Dashboard** anklicken, die Listenseite geöffnet lassen, `tanktrouble-netlab.install.user.js` aus dem entpackten Ordner auf die Dashboard-Seite ziehen und **Install** klicken. Wenn Ziehen nicht geht, **Dashboard → Utilities → Install from URL** verwenden.
5. **Spielseite neu laden**

   <https://tanktrouble.com/game> öffnen (neu laden, falls schon offen). Oben links erscheint die Kugel; anklicken, aufklappen und loslegen.

`tanktrouble-netlab.user.js` ist identisch; `install.user.js` ist die BOM-Kopie zum Ziehen.

## Selbstprüfung (drei Punkte)

① Die **Dashboard**-Liste zeigt "TankTrouble Network Optimization" und der Schalter steht auf **ON**; ② auf einer `tanktrouble.com`-Seite zeigt das Tampermonkey-Symbol ein Zahlen-Badge (**1**); ③ drücke **F12 → Console** — dort muss `[TT NetLab vX.Y.Z] loaded...` stehen.

## Einsteiger-FAQ (wenn du verwirrt bist, lies das)

- **Ist das eine Chrome-Erweiterung? Muss ich sie in chrome://extensions hinzufügen?** — Nein, es ist ein Userscript. Installiere zuerst Tampermonkey und dann das Script darin. „Entpackte Erweiterung laden“ wird nicht benutzt.
- **Tampermonkey sieht unseriös aus.** — Tampermonkey ist der verbreitetste Userscript-Manager für Chrome/Edge/Firefox und kommt aus den offiziellen Stores (tampermonkey.net). Das Projekt ist Open Source auf GitHub; Server, VPN oder Netzwerkeinstellungen sind nicht nötig.
- **Ich habe die ZIP geladen — soll ich den ganzen Ordner hineinziehen?** — Nein. Bei Methode A brauchst du die ZIP gar nicht: Lade die einzelne Datei `tanktrouble-netlab.install.user.js` herunter (Schritt 2) und ziehe nur diese Datei aus „Downloads“ in das Tampermonkey-Dashboard. Ein ganzer Ordner ist kein Script und wird nicht installiert.
- **Wo ist das Tampermonkey-Dashboard und wie öffne ich es?** — Klicke in der Symbolleiste auf das **Tampermonkey-Symbol** → **Dashboard**. Kein Symbol? Klicke auf die Puzzle-/Erweiterungen-Schaltfläche und pinne Tampermonkey. Wenn du schon auf einer anderen Tampermonkey-Seite bist, klicke links auf **Installed scripts / Installierte Skripte**, um zur Liste zurückzukommen. ⚠️ Nutze nicht den Menüpunkt „**Neues Skript hinzufügen**“ — er öffnet den Editor, nicht den Installations-Einstieg.
- **Ich habe „Neues Skript hinzufügen“ geklickt und einen Editor bekommen — ist das der Installations-Einstieg?** — Nein. „Neues Skript hinzufügen“ öffnet den Tampermonkey-**Editor** zum Schreiben eines Skripts; dort wird dieses Skript nicht installiert. Der Installations-Einstieg ist die Listenseite des **Dashboard** („Installierte Skripte“): Ziehe die heruntergeladene `tanktrouble-netlab.install.user.js` auf diese Seite, oder nutze **Dashboard → Utilities / Dienstprogramme → Install from URL** und füge `https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js` ein.
- **Der Download-Link zeigt eine Seite voller Code / Chrome sagt, von dieser Seite kann nicht installiert werden.** — Bei Methode A ist das in Ordnung — der Link soll die Datei nur speichern (schau im Ordner „Downloads“ nach `tanktrouble-netlab.install.user.js`). Ziehe die Datei dann auf die Listenseite des Tampermonkey-**Dashboard**. Falls sie nicht gespeichert wurde: Rechtsklick auf den Link → „Link speichern unter…“, oder **Dashboard → Utilities → Install from URL** mit demselben Link.
- **Ich ziehe die Datei hinein, nichts passiert.** — Ziehe sie direkt auf die Listenseite des Tampermonkey-**Dashboard** (nicht chrome://extensions und nicht auf eine normale Webseite) und lass diese Seite offen und im Vordergrund. Wenn Drag-and-drop blockiert ist, nutze **Dashboard → Utilities → Install from URL**.
- **Installiert, aber im Spiel erscheint nichts.** — Spielseite mit Ctrl+F5 neu laden, im Dashboard prüfen, ob das Script aktiv ist, und Ctrl+Shift+L für das HUD drücken. Eine vor der Installation offene Seite muss neu geladen werden.
- **ZIP/Ordner nach der Installation behalten?** — Nein. Das Script liegt jetzt in Tampermonkey; die ZIP kann gelöscht werden. Updates über Tampermonkey oder erneutes Installieren des Raw-Links.
- **In Tampermonkey gibt es „Aus Datei importieren“/„Add file“ — soll ich es dort hochladen?** — Nein, dieser Button ist für Tampermonkey-Backup-`.zip`-Dateien. Zum Installieren: Dashboard → Dienstprogramme → Von URL installieren, oder die einzelne `.user.js`-Datei aufs Dashboard ziehen.
- **Muss ich die `.user.js` umbenennen, bearbeiten oder entpacken?** — Nein, benutze sie unverändert. Die Datei ist der Script-Text selbst; nicht in `chrome://extensions` legen und nicht den ganzen Ordner hochladen.
- **Ich habe den Ein-Klick-Link (Methode B) angeklickt — ist es wirklich installiert?** — Wenn es geklappt hat, **öffnet Tampermonkey seine eigene Installationsseite**: eine dunkle Seite mit dem Skriptnamen "TankTrouble Network Optimization", der Versionsnummer und einem **Install**-Button — erst der Klick auf **Install** installiert es. Wenn du eine Seite voller Code (beginnend mit `// ==UserScript==`) siehst oder die Datei nur heruntergeladen wurde, hat der Klick Tampermonkey nicht erreicht: Geh zurück zu **Methode A** und ziehe die heruntergeladene `tanktrouble-netlab.install.user.js` auf die **Dashboard**-Seite, oder nutze **Dashboard → Utilities → Install from URL**.
- **Wie prüfe ich, ob es wirklich installiert ist und läuft?** — Drei Prüfungen: ① In der Skriptliste des Tampermonkey-**Dashboard** steht „TankTrouble Network Optimization“ und der Schalter ist auf **ON**; ② auf einer Seite von `tanktrouble.com` erscheint ein Zahlen-Badge (**1**) am Tampermonkey-Symbol; ③ drücke **F12 → Console** — dort sollte eine Zeile `[TT NetLab vX.Y.Z] loaded...` stehen. Wenn ③ fehlt: Lade die Seite zuerst mit **Ctrl+F5** neu; fehlt es weiterhin, ist das Skript deaktiviert oder nur teilweise installiert (**neu installieren**; die Datei muss in Zeile 1 mit `// ==UserScript==` beginnen — ab der Mitte wie `(function () {` zu kopieren funktioniert nicht).

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

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [TECHNICAL.zh.md (中文)](TECHNICAL.zh.md)

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · <b>🇩🇪 Deutsch</b> · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>
