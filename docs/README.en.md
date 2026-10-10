# 🇬🇧 TankTrouble Network Optimization

<p align="right"><sub><b>🇬🇧 English</b> · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

<img src="img/v053/panel-en.png" width="440" alt="panel"> <img src="img/v053/ball-en.png" width="150" alt="floating ball">

> Richer, more real-time and more accurate network display — plus real optimization.

A Tampermonkey userscript for **tanktrouble.com**: it shows what your connection is really doing, and turns the TCP head-of-line-blocking "freeze → teleport" into a smooth glide.

**No server, no network configuration, not a VPN.** Pure client-side — the server sees exactly the same bytes as before.

The optimization only changes *what you see*: the position is smoothed at render time, while the game logic, physics and server validation always use the real values. Your own tank is locally authoritative, so a reconnect will not drag you back.

## One-click install · Features

| | |
|---|---|
| Richer | line / avg / live / max / jitter / stalls / stability, updating in real time |
| More real-time | a dedicated 2-second ping probe — real RTT instead of frame intervals |
| More accurate | real stalls (head-of-line blocking) are separated from lobby / between-rounds idle gaps |
| Real optimization | render-time smoothing + local authority + dead reckoning, with a live A/B switch |

## ⚠️ This is a userscript — not a browser extension

Install **Tampermonkey** (a userscript manager) first. Do **not** use `chrome://extensions` / "Load unpacked": a `.user.js` file is managed by Tampermonkey, not installed as a browser extension. If a page full of code appears, you are at the wrong entry — come back to this tutorial.

## Method A — drag the downloaded file onto the Tampermonkey Dashboard (recommended, simplest)

### Step 1 (only once) — install Tampermonkey

Chrome/Edge: open the [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → **Add to Chrome**. Firefox: open [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → **Add to Firefox**.

After installing, if you don't see the Tampermonkey icon in the toolbar: click the **puzzle-piece / extensions** button at the top-right of the browser and **pin** Tampermonkey.

### Step 2 — download the script file

Click **[⬇ Download](https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js)** (or open the link below). The browser saves the file to your **Downloads** folder as `tanktrouble-netlab.install.user.js`.

Do **not** rename, unzip or edit it — it is a plain text script.

```
https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js
```

### Step 3 — open the Tampermonkey **Dashboard** (most people get stuck here)

Click the **Tampermonkey icon** in the browser toolbar → in the popup menu click **Dashboard**.

- Can't find the icon: click the **puzzle-piece / extensions** button, then click Tampermonkey.
- ⚠️ The **Add new script** item in that menu opens the **editor**, not the install entry. Use the **Dashboard** (in the Chinese UI it is called "管理面板").
- If you are already on some other Tampermonkey page, click **Installed scripts** in the left sidebar to get back to the list page.

### Step 4 — drag the file in

Keep the **Dashboard list page** open, then drag `tanktrouble-netlab.install.user.js` from your **Downloads** folder **onto the Dashboard page** → Tampermonkey's install page appears (a dark page showing the script name "TankTrouble Network Optimization", the version number and an **Install** button) → click **Install**.

- If dragging does not work: **Dashboard → Utilities → Install from URL**, paste the same download link, click **Install**.
- You can also click the one-click link directly (kept as **Method B** below): with Tampermonkey installed it opens the install page straight away. If you see a page full of code starting with `// ==UserScript==`, the click did not reach Tampermonkey → go back to this drag method.

### Step 5 — open the game

Open <https://tanktrouble.com/game> → hard-refresh with **Ctrl + F5** → the panel or floating ball appears in the top-left. If you don't see it, press **Ctrl + Shift + L** — it may be hidden.

## Method B — one-click install (Tampermonkey must already be installed)

[![Install](https://img.shields.io/badge/install-en-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

With Tampermonkey installed, click the badge (or the link below): Tampermonkey opens its own install page — a dark page showing the script name "TankTrouble Network Optimization", the version number and an **Install** button; only after clicking **Install** is the script installed. If you see a full page of code starting with `// ==UserScript==`, this click did not reach Tampermonkey — go back to **Method A**.

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Method C — install from the downloaded ZIP (offline)

If you already know how to drag-install, **Method A is enough — you don't need the ZIP**. Use the ZIP only if you want to keep the whole repository offline.

1. **Download the ZIP**

   On the [GitHub repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) click **Code → Download ZIP**.
2. **Unzip it**

   Extract the ZIP to a normal folder (Windows: right-click → Extract All).
3. **Make sure Tampermonkey is installed**

   If it isn't, go back to Method A, step 1. Do **not** use `chrome://extensions`.
4. **Load the userscript**

   Click the Tampermonkey icon → **Dashboard**, keep the list page open, drag `tanktrouble-netlab.install.user.js` from the unzipped folder onto the Dashboard page, then click **Install**. If dragging does not work, use **Dashboard → Utilities → Install from URL**.
5. **Refresh the game**

   Open <https://tanktrouble.com/game> (refresh if it was already open). The floating ball appears in the top-left; click it to expand and start using.

`tanktrouble-netlab.user.js` is the same script; `install.user.js` is just the drag-and-drop copy with a UTF-8 BOM.

## Self-check (three items)

① The **Dashboard** script list shows "TankTrouble Network Optimization" and its toggle is **ON**. ② On a `tanktrouble.com` page the Tampermonkey icon shows a numbered badge (**1**). ③ Press **F12 → Console**; you should see `[TT NetLab vX.Y.Z] loaded...`.

## Newbie FAQ (read this if you are confused)

- **Is this a Chrome extension? Should I add it on chrome://extensions?** — No. It is a userscript. Install Tampermonkey first; the script is installed inside Tampermonkey — never via "Load unpacked".
- **What is Tampermonkey? It looks like a shady app.** — Tampermonkey is the standard userscript manager for Chrome/Edge/Firefox, available from the official stores (tampermonkey.net). This project is open source on GitHub and needs no server, VPN or network settings.
- **I downloaded the ZIP. Do I drag the whole unzipped folder in?** — No. In Method A you don't need the ZIP at all: download the single file `tanktrouble-netlab.install.user.js` (step 2) and drag only that file from your Downloads folder into the Tampermonkey Dashboard. A whole folder is not a script and will not install.
- **Where is the Tampermonkey Dashboard, and how do I open it?** — Click the **Tampermonkey icon** in the browser toolbar → **Dashboard**. Don't see the icon? Click the puzzle-piece/extensions button and pin Tampermonkey. If you are already on another Tampermonkey page, click **Installed scripts** in the left sidebar to get back to the list. ⚠️ Don't use the "**Add new script**" menu item — that opens the editor, not the install entry.
- **I clicked "Add new script" and got an editor — is that the install entry?** — No. "Add new script" opens Tampermonkey's **editor** for writing a script; it is not where you install this one. The install entry is the **Dashboard** list page ("Installed scripts"): drag the downloaded `tanktrouble-netlab.install.user.js` onto that page, or use **Dashboard → Utilities → Install from URL** and paste `https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js`.
- **The download link shows a page of code / Chrome says it cannot install from this site.** — That's fine for Method A — that link is only meant to save the file (check your Downloads folder for `tanktrouble-netlab.install.user.js`). Then drag the file onto the Tampermonkey **Dashboard** list page. If the file did not download, right-click the link → "Save link as…", or use **Dashboard → Utilities → Install from URL** and paste the same link.
- **I dragged the file but nothing happens.** — Drop it right on the Tampermonkey **Dashboard** list page (not chrome://extensions and not a normal web page), keeping that page open and in front. If drag-and-drop is blocked, use **Dashboard → Utilities → Install from URL** and paste the download link.
- **I installed it, but I don't see anything in the game.** — Refresh the game page with Ctrl+F5, check that the script toggle is ON in the Tampermonkey Dashboard, and press Ctrl+Shift+L to show the HUD. A page opened before installing must be refreshed.
- **Do I still need the ZIP/folder after installation?** — No. The script now lives inside Tampermonkey; you can delete the ZIP and folder. Update later from Tampermonkey or by reinstalling the raw link.
- **Tampermonkey has an "Import from file" / "Add file" button — is that where I upload it?** — No. That button is for Tampermonkey backup `.zip` files. To install this script use Dashboard → Utilities → Install from URL, or drag the single `.user.js` file onto the Dashboard.
- **Do I need to rename, edit or unzip the `.user.js` again?** — No, use the file exactly as it is. That file is the script text itself; do not put it into chrome://extensions and do not upload the whole folder.
- **I clicked the one-click install link (Method B) — did it actually install?** — If it worked, **Tampermonkey opens its own install page**: a dark page showing the script name "TankTrouble Network Optimization", the version number and an **Install** button — clicking **Install** is what installs it. If you see a full page of code (starting with `// ==UserScript==`), or the file was just downloaded, then this click did NOT reach Tampermonkey: go back to **Method A** and drag the downloaded `tanktrouble-netlab.install.user.js` onto the **Dashboard** page, or use **Dashboard → Utilities → Install from URL**.
- **How do I confirm it is really installed and running?** — Three checks: ① the script list of the Tampermonkey **Dashboard** shows "TankTrouble Network Optimization" and its toggle is **ON**; ② on a `tanktrouble.com` page, the Tampermonkey icon shows a numbered badge (**1**); ③ press **F12 → Console** — you should see a line `[TT NetLab vX.Y.Z] loaded...`. If ③ is missing: reload the page with **Ctrl+F5** first; if it is still missing, the script is disabled or only partially installed — **reinstall**. The file must start at line 1 with `// ==UserScript==`; starting from the middle such as `(function () {` does not work.

## Hotkeys

| Key | |
|---|---|
| `Ctrl+Shift+S` | toggle the network optimization (live A/B) |
| `Ctrl+Shift+L` | hide / show the HUD |
| `Ctrl+Shift+E` | export the diagnostic report (also copied to clipboard) |
| `Ctrl+Shift+P` | probe all 7 server regions and rank them |

The **⚡** button in the panel does the same as `Ctrl+Shift+S`. The panel also lets you pick one of **11 languages**; language, optimization switch and floating-ball position are cached in `localStorage`.

## Troubleshooting

- **Nothing appears** — Check that the URL matches `*://*.tanktrouble.com/*` and the script is enabled, then `Ctrl+F5`.
- **The panel is gone** — Press `Ctrl+Shift+L`. Position and collapsed state are remembered.
- **Still choppy** — That is your line, not the script. Export a report (`Ctrl+Shift+E`) and compare regions in the panel.

## Links

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [TECHNICAL.zh.md (中文)](TECHNICAL.zh.md)

<p align="right"><sub><b>🇬🇧 English</b> · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>
