# 安装教程

> 🇨🇳 **TankTrouble 网络优化** — 更丰富、更实时、更准确的网络情况显示，以及真正的网络优化。

<p align="right"><sub>[🇬🇧 English](en.md) · <b>🇨🇳 中文</b> · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ 这是油猴脚本，不是浏览器扩展

必须先安装 **Tampermonkey（油猴）**。不要用 Chrome 的“加载已解压的扩展程序”/扩展页安装 —— `.user.js` 由油猴管理，不是浏览器扩展。

## 方法 A — 一键安装（推荐）

[![Install](https://img.shields.io/badge/install-zh-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

点上面的按钮（或直接打开下面的地址）。成功的话会看到 Tampermonkey 自己的安装页——深色页面，显示脚本名、版本号和 **Install** 按钮；只有再点 **Install** 才算装好。（如果看到满屏代码（以 `// ==UserScript==` 开头），或文件只是被下载了，说明这次点击没进到 Tampermonkey——请看下面的 FAQ。）

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## 方法 B — 从下载的 ZIP 安装

1. **下载源码 ZIP**

   在 [GitHub 仓库页](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) 点 **Code → Download ZIP**。
2. **解压**

   把 ZIP 解压到普通文件夹（Windows：右键 → 全部解压缩）。
3. **安装油猴**

   Chrome/Edge：打开 [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) 添加到 Chrome；然后进 `chrome://extensions` 打开**开发者模式**。Firefox：打开 [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) 添加到 Firefox。
4. **加载脚本**

   点浏览器工具栏的油猴图标 → **管理面板**。把解压目录里的 `tanktrouble-netlab.install.user.js` 拖到管理页面；出现安装页后点 **安装**。
5. **刷新游戏网页**

   打开 <https://tanktrouble.com/game>（已打开就刷新）。左上角会出现悬浮球，点一下展开就能开始使用。

拖拽不生效时：用上面的“一键安装”地址，或在油猴管理面板 → 实用工具里导入文件。`tanktrouble-netlab.user.js` 内容相同；`install.user.js` 只是带 UTF-8 BOM、方便拖拽的副本。

## 快捷键

| Key | |
|---|---|
| `Ctrl+Shift+S` | 开关网络优化（实时 A/B 对比） |
| `Ctrl+Shift+L` | 隐藏 / 显示 HUD |
| `Ctrl+Shift+E` | 导出诊断报告（同时复制到剪贴板） |
| `Ctrl+Shift+P` | 探测 7 个服务器区域并排名 |

面板里的 **⚡** 按钮和 `Ctrl+Shift+S` 等价。面板里还能选 **11 国语言**，语言 / 优化开关 / 悬浮球位置都会缓存在 `localStorage`。

## 新手常见疑问（看不懂先看这里）

- **这是浏览器扩展吗？要加到 chrome://extensions 吗？** — 不是。它是油猴脚本；先装 Tampermonkey（油猴），脚本是在油猴里安装，不要用“加载已解压的扩展程序”。
- **Tampermonkey 看着像可疑软件？** — Tampermonkey 是 Chrome/Edge/Firefox 上最常用的用户脚本管理器，只在官方商店安装（tampermonkey.net）；本项目开源在 GitHub，不用服务器、VPN 或改网络设置。
- **ZIP 解压后要把整个文件夹拖进去吗？** — 不用。只把单个文件 `tanktrouble-netlab.install.user.js` 拖进油猴管理面板；整个文件夹不是脚本，装不上。
- **油猴管理面板怎么打开？** — 点浏览器工具栏的油猴图标 → 管理面板；看不到图标就点拼图（扩展）按钮，把 Tampermonkey 固定出来。
- **打开 raw 链接只看到代码 / Chrome 提示不能从此网站安装。** — 装好油猴后再打开 raw 链接，油猴会弹出自己的安装页；如果没有，复制链接，用油猴管理面板 → 实用工具 → 从 URL 安装。
- **把文件拖进去没反应？** — 要拖到油猴管理面板页面上（不是 chrome://extensions，也不是普通网页）。拖拽被拦时用一键链接，或管理面板 → 实用工具 → 从 URL 安装。
- **装完游戏里没看到东西？** — 用 Ctrl+F5 强制刷新游戏页；确认油猴管理面板里脚本开关是开启的；按 Ctrl+Shift+L 显示 HUD。安装前就打开的页面必须刷新。
- **装完还需要留着 ZIP/文件夹吗？** — 不需要。脚本已经进油猴了，ZIP 和文件夹可以删；以后在油猴里更新或重新打开 raw 链接安装即可。
- **油猴里的“从文件导入”/“添加文件”是在那里上传吗？** — 不是。那个按钮是给 Tampermonkey 备份 `.zip` 用的。安装这个脚本请用 Dashboard → 实用工具 → 从 URL 安装，或把单个 `.user.js` 文件拖到 Dashboard。
- **.user.js 需要改名、编辑或再解压吗？** — 不需要，原样使用即可。它本身就是脚本文本；不要放进 `chrome://extensions`，也不要上传整个文件夹。
- **我点了一键安装（方法 A），到底装上了没有？** — 如果成功，**Tampermonkey 会打开它自己的安装页**：深色页面，显示脚本名 “TankTrouble Network Optimization”、版本号，以及一个 **Install** 按钮——点 **Install** 才算装好。如果你看到的是满屏代码（以 `// ==UserScript==` 开头）、或者文件只是被下载了，那说明这次点击没有交给 Tampermonkey。请改用：**Dashboard → Utilities → Install from URL**（粘贴 `https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js`），或把下载好的 `tanktrouble-netlab.install.user.js` 拖到 **Dashboard** 页面。另外：GitHub 的 raw 链接可能有几分钟缓存，若安装页显示的版本偏旧，等一会儿或 `Ctrl+F5` 再点一次。
- **怎么确认它真的装上了、而且在运行？** — 三个检查：① Tampermonkey **Dashboard** 的脚本列表里能看到 “TankTrouble Network Optimization”，并且开关是 **ON**；② 在 `tanktrouble.com` 页面上，Tampermonkey 图标上会出现数字角标（**1**）；③ 按 **F12 → Console**，应看到一行 `[TT NetLab vX.Y.Z] loaded...`。如果 ③ 没有：先用 **Ctrl+F5** 重新加载页面；仍然没有就说明脚本被禁用或只装了一部分（**重装**，注意文件必须从第 1 行 `// ==UserScript==` 开始，从 `(function () {` 之类的中段开始复制是无效的）。

## 常见问题

- **什么都没出现** — 确认地址匹配 `*://*.tanktrouble.com/*`、脚本是启用状态，然后 `Ctrl+F5` 强制刷新。
- **面板不见了** — 按 `Ctrl+Shift+L`。HUD 会记住位置和「是否收起成球」。
- **还是卡** — 那是线路问题，不是脚本。用 `Ctrl+Shift+E` 导出报告，在面板里对比各个区域。

## 相关

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [中文](../README.zh.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
