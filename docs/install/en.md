# Install tutorial

> 🇬🇧 **TankTrouble Network Optimization** — Richer, more real-time and more accurate network display — plus real optimization.

<p align="right"><sub><b>🇬🇧 English</b> · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ This is a userscript — not a browser extension

Install **Tampermonkey** (a userscript manager) first. Do **not** use Chrome's *Load unpacked* / extensions page: the `.user.js` file is managed by Tampermonkey, not installed as a browser extension.

## Method A — one-click install (recommended)

[![Install](https://img.shields.io/badge/install-en-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

After Tampermonkey is installed, click the badge above (or open the URL below): Tampermonkey opens its install page, then click **Install**.

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Method B — install from the downloaded ZIP

1. **Download the ZIP**

   On the [GitHub repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) click **Code → Download ZIP**.
2. **Unzip it**

   Extract the ZIP to a normal folder (Windows: right-click → Extract All).
3. **Install Tampermonkey**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → Add to Chrome; then open `chrome://extensions` and turn on **Developer mode**. Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → Add to Firefox.
4. **Load the userscript**

   Open Tampermonkey from the browser toolbar → **Dashboard**. Drag `tanktrouble-netlab.install.user.js` from the unzipped folder onto the Dashboard page, then click **Install** on the page that appears.
5. **Refresh the game**

   Open <https://tanktrouble.com/game> (refresh if it was already open). The floating ball appears in the top-left; click it to expand and start using.

If dragging does not work: use the one-click link above, or import the file from Tampermonkey Dashboard → Utilities. `tanktrouble-netlab.user.js` is the same script; `install.user.js` is just the drag-and-drop copy with UTF-8 BOM.

## Hotkeys

| Key | |
|---|---|
| `Ctrl+Shift+S` | toggle the network optimization (live A/B) |
| `Ctrl+Shift+L` | hide / show the HUD |
| `Ctrl+Shift+E` | export the diagnostic report (also copied to clipboard) |
| `Ctrl+Shift+P` | probe all 7 server regions and rank them |

The **⚡** button in the panel does the same as `Ctrl+Shift+S`. The panel also lets you pick one of **11 languages**; language, optimization switch and floating-ball position are cached in `localStorage`.

## Newbie FAQ (read this if you are confused)

- **Is this a Chrome extension? Should I add it on chrome://extensions?** — No. It is a userscript. Install Tampermonkey first; the script is installed inside Tampermonkey — never via "Load unpacked".
- **What is Tampermonkey? It looks like a shady app.** — Tampermonkey is the standard userscript manager for Chrome/Edge/Firefox, available from the official stores (tampermonkey.net). This project is open source on GitHub and needs no server, VPN or network settings.
- **I downloaded the ZIP. Do I drag the whole unzipped folder in?** — No — drag only the single file `tanktrouble-netlab.install.user.js` into the Tampermonkey Dashboard. A whole folder is not a script and will not install.
- **How do I open the Tampermonkey Dashboard?** — Click the Tampermonkey icon in the browser toolbar → Dashboard. If you don't see the icon, click the puzzle-piece/extensions button and pin Tampermonkey.
- **The raw link shows code / Chrome says it cannot install from this site.** — With Tampermonkey installed, open the raw link — Tampermonkey shows its own install page. If not, copy the URL and use Tampermonkey Dashboard → Utilities → Install from URL.
- **I dragged the file but nothing happens.** — Drop it on the Tampermonkey Dashboard page (not chrome://extensions or a normal web page). If drag-and-drop is blocked, use the one-click link or Dashboard → Utilities → Install from URL.
- **I installed it, but I don't see anything in the game.** — Refresh the game page with Ctrl+F5, check that the script toggle is ON in the Tampermonkey Dashboard, and press Ctrl+Shift+L to show the HUD. A page opened before installing must be refreshed.
- **Do I still need the ZIP/folder after installation?** — No. The script now lives inside Tampermonkey; you can delete the ZIP and folder. Update later from Tampermonkey or by reinstalling the raw link.

## Troubleshooting

- **Nothing appears** — Check that the URL matches `*://*.tanktrouble.com/*` and the script is enabled, then `Ctrl+F5`.
- **The panel is gone** — Press `Ctrl+Shift+L`. Position and collapsed state are remembered.
- **Still choppy** — That is your line, not the script. Export a report (`Ctrl+Shift+E`) and compare regions in the panel.

## Links

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [English](../README.en.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
