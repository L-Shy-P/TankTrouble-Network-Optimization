# 安装教程

> 🇨🇳 **TankTrouble 网络优化** — 更丰富、更实时、更准确的网络情况显示，以及真正的网络优化。

<p align="right"><sub>[🇬🇧 English](en.md) · <b>🇨🇳 中文</b> · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ 这是油猴脚本，不是浏览器扩展

必须先安装 **Tampermonkey（油猴）**。不要用 Chrome 的“加载已解压的扩展程序”/扩展页安装 —— `.user.js` 由油猴管理，不是浏览器扩展。

## 方法 A — 一键安装（推荐）

[![Install](https://img.shields.io/badge/install-zh-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

装好油猴后，点上面的按钮（或打开下面的地址）：油猴会弹出安装页，点 **安装** 即可。

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

## 常见问题

- **什么都没出现** — 确认地址匹配 `*://*.tanktrouble.com/*`、脚本是启用状态，然后 `Ctrl+F5` 强制刷新。
- **面板不见了** — 按 `Ctrl+Shift+L`。HUD 会记住位置和「是否收起成球」。
- **还是卡** — 那是线路问题，不是脚本。用 `Ctrl+Shift+E` 导出报告，在面板里对比各个区域。

## 相关

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [中文](../README.zh.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
