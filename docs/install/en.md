# Install tutorial

> 🇬🇧 **TankTrouble Network Optimization** — Richer, more real-time and more accurate network display — plus real optimization.

<p align="right"><sub><b>🇬🇧 English</b> · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md)</sub></p>

## One-click install

[![Install](https://img.shields.io/badge/install-en-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Click the badge (or open the URL below) → Tampermonkey opens the install page → press **Install**:

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Steps

1. **Install Tampermonkey**

   Chrome/Edge: open the [Chrome Web Store page](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo). Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/). Click *Add to browser* → *Add extension*.

2. **Enable developer mode (Chrome/Edge only)**

   Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode** in the top-right corner. Recent Chrome requires it for userscripts.

3. **Install this script**

   Click **Install the script** below — Tampermonkey opens an install page. Press **Install**.

4. **Open the game**

   Go to <https://tanktrouble.com/game> and join a match. A panel appears in the top-left corner.

5. **Use it**

   Drag the title bar to move it. Click the dot to collapse into the floating ball (avg / live latency / stability); click the ball to expand. `Ctrl+Shift+S` toggles the optimization, `Ctrl+Shift+L` hides the HUD, `Ctrl+Shift+E` exports a report.

## Hotkeys

| Key | |
|---|---|
| `Ctrl+Shift+S` | toggle the network optimization (live A/B) |
| `Ctrl+Shift+L` | hide / show the HUD |
| `Ctrl+Shift+E` | export the diagnostic report (also copied to clipboard) |
| `Ctrl+Shift+P` | probe all 7 server regions and rank them |

The **⚡** button in the panel does the same as `Ctrl+Shift+S`. The panel also lets you pick one of **10 languages**; language, optimization switch and floating-ball position are cached in `localStorage`.

## Troubleshooting

- **Nothing appears** — Check that the URL matches `*://*.tanktrouble.com/*` and the script is enabled, then `Ctrl+F5`.
- **The panel is gone** — Press `Ctrl+Shift+L`. Position and collapsed state are remembered.
- **Still choppy** — That is your line, not the script. Export a report (`Ctrl+Shift+E`) and compare regions in the panel.

## Links

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [English](../README.en.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
