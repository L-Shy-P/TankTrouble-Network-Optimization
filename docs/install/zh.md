# 安装教程

> 🇨🇳 **TankTrouble 网络优化** — 更丰富、更实时、更准确的网络情况显示，以及真正的网络优化。

<p align="right"><sub>[🇬🇧 English](en.md) · <b>🇨🇳 中文</b> · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## 一键安装

[![Install](https://img.shields.io/badge/install-zh-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

点上面的按钮（或直接打开下面的地址）→ 油猴会弹出安装页 → 点 **安装**：

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## 步骤

1. **安装油猴（Tampermonkey）**

   Chrome/Edge 打开 [Chrome 应用商店页](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)；Firefox 打开 [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/)。点「添加到浏览器」→「添加扩展程序」。

2. **打开开发者模式（仅 Chrome/Edge 需要）**

   进入 `chrome://extensions`（或 `edge://extensions`），打开右上角的**开发者模式**。新版 Chrome 需要它才能跑用户脚本。

3. **安装本脚本**

   点下面的**安装脚本**，油猴会弹安装页，点**安装**。

4. **打开游戏**

   访问 <https://tanktrouble.com/game> 并进一局。左上角会出现面板。

5. **怎么用**

   拖标题栏可移动；点左上角圆点收起成悬浮球（平均 / 实时延迟 / 稳定度）；点球展开。`Ctrl+Shift+S` 开关优化，`Ctrl+Shift+L` 隐藏 HUD，`Ctrl+Shift+E` 导出报告。

## 快捷键

| Key | |
|---|---|
| `Ctrl+Shift+S` | 开关网络优化（实时 A/B 对比） |
| `Ctrl+Shift+L` | 隐藏 / 显示 HUD |
| `Ctrl+Shift+E` | 导出诊断报告（同时复制到剪贴板） |
| `Ctrl+Shift+P` | 探测 7 个服务器区域并排名 |

面板里的 **⚡** 按钮和 `Ctrl+Shift+S` 等价。面板里还能选 **10 国语言**，语言 / 优化开关 / 悬浮球位置都会缓存在 `localStorage`。

## 常见问题

- **什么都没出现** — 确认地址匹配 `*://*.tanktrouble.com/*`、脚本是启用状态，然后 `Ctrl+F5` 强制刷新。
- **面板不见了** — 按 `Ctrl+Shift+L`。HUD 会记住位置和「是否收起成球」。
- **还是卡** — 那是线路问题，不是脚本。用 `Ctrl+Shift+E` 导出报告，在面板里对比各个区域。

## 相关

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [中文](../README.zh.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
