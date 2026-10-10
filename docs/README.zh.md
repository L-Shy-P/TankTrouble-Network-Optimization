# 🇨🇳 TankTrouble 网络优化

<p align="right"><sub>[🇬🇧 English](en.md) · <b>🇨🇳 中文</b> · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

<img src="img/v053/panel-zh.png" width="440" alt="panel"> <img src="img/v053/ball-zh.png" width="150" alt="floating ball">

> 更丰富、更实时、更准确的网络情况显示，以及真正的网络优化。

给 **tanktrouble.com** 写的油猴脚本：把你这局的网络情况如实显示出来，并把 TCP 队头阻塞造成的「僵住 → 瞬移」抹平成滑行。

**不用服务器、不用改任何网络配置、不是加速器**：纯客户端，服务端看到的数据一个字节都没变。

优化只改**你看到的东西**：渲染那一瞬间的位置被平滑，游戏逻辑 / 物理 / 服务端校验全程用真值；你自己的坦克以本地为准，断线重连不会被拉回去。

## 一键安装 · Features

| | |
|---|---|
| 更丰富 | 线路 / 平均 / 实时 / 最大 / 小抖动 / 卡顿 / 稳定度，实时刷新 |
| 更实时 | 独立的 2 秒 ping 探测，量的是真 RTT，不是帧间隔 |
| 更准确 | 把「真卡顿（队头阻塞）」和「大厅/局间空闲」分开算 |
| 真优化 | 渲染期平滑 + 本地权威 + 静默外推，开关可实时 A/B 对比 |

## ⚠️ 这是油猴脚本，不是浏览器扩展

必须先安装油猴脚本管理器 **Tampermonkey（油猴）**。**不要**用 `chrome://extensions` / “加载已解压的扩展程序”安装：`.user.js` 归 Tampermonkey 管理，不是浏览器扩展。如果看到满屏代码，说明走错了入口——请回到本教程。

## 方法 A — 把下载好的文件拖进油猴「管理面板」（推荐，最简单）

### 第 1 步（只做一次）— 安装 Tampermonkey

Chrome/Edge：打开 [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → **添加至 Chrome**。Firefox：打开 [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → **添加到 Firefox**。

装完如果工具栏看不到油猴图标：点浏览器右上角的**拼图 / 扩展**按钮，把 **Tampermonkey** 固定（Pin）出来。

### 第 2 步 — 下载脚本文件

点 **[⬇ Download](https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js)**（或直接打开下面的链接）：浏览器会把文件保存到「下载」文件夹，文件名是 `tanktrouble-netlab.install.user.js`。

**不要改名、不要解压、不要编辑**——它就是一份文本脚本。

```
https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js
```

### 第 3 步 — 打开油猴的「管理面板」（很多人卡在这一步）

点浏览器工具栏上的 **Tampermonkey 图标** → 在弹出的菜单里点 **管理面板 / Dashboard**。

- 找不到图标：点**拼图 / 扩展**按钮，再点 Tampermonkey。
- ⚠️ 菜单里的「**添加新脚本**」打开的是**编辑器**，不是安装入口；请用**管理面板**（中文界面即“管理面板”）。
- 如果你已经在别的 Tampermonkey 页面，点左侧的「**已安装脚本 / Installed scripts**」回到列表页。

### 第 4 步 — 把文件拖进去

保持**管理面板列表页**打开 → 从「下载」文件夹把 `tanktrouble-netlab.install.user.js` **拖到管理面板页面上** → 会出现油猴的安装页（深色页面，显示脚本名 "TankTrouble Network Optimization" + 版本号 + **Install** 按钮）→ 点 **Install**。

- 拖拽不生效时：**管理面板 → 实用工具 / Utilities → Install from URL**，粘贴同一个下载链接，点 **Install**。
- 也可以直接点一键安装链接（保留为下面的**方法 B**）：油猴已装好时会直接弹安装页；若看到一屏 `// ==UserScript==` 代码，说明没交给油猴 → 回到上面的拖拽法。

### 第 5 步 — 进游戏

打开 <https://tanktrouble.com/game> → **Ctrl + F5** 硬刷新 → 左上角出现面板或悬浮球。看不到就按 **Ctrl + Shift + L**，可能是被隐藏了。

## 方法 B — 一键安装（已装好 Tampermonkey 时）

[![Install](https://img.shields.io/badge/install-zh-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

油猴已装好时，点上面的按钮（或下面的链接）：油猴会直接打开自己的安装页——深色页面，显示脚本名 "TankTrouble Network Optimization"、版本号和 **Install** 按钮；点 **Install** 才算装好。若看到以 `// ==UserScript==` 开头的满屏代码，说明这次点击没交给油猴 → 请回到**方法 A** 的拖拽法。

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## 方法 C — 从下载的 ZIP 安装（离线）

如果你已经会拖拽安装，用**方法 A 就够了，不需要下载 ZIP**；只有想离线保存整个仓库时才用 ZIP。

1. **下载源码 ZIP**

   在 [GitHub 仓库页](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) 点 **Code → Download ZIP**。
2. **解压**

   把 ZIP 解压到普通文件夹（Windows：右键 → 全部解压缩）。
3. **确认已装 Tampermonkey**

   如果还没装，回到方法 A 第 1 步；**不要**用 `chrome://extensions`。
4. **加载脚本**

   点油猴图标 → **管理面板**，保持列表页打开，把解压目录里的 `tanktrouble-netlab.install.user.js` **拖到管理面板页面上**，出现安装页后点 **Install**；拖拽不生效就用 **管理面板 → Utilities → Install from URL**。
5. **刷新游戏网页**

   打开 <https://tanktrouble.com/game>（已打开就刷新）。左上角会出现悬浮球，点一下展开就能开始使用。

`tanktrouble-netlab.user.js` 内容相同；`install.user.js` 只是带 UTF-8 BOM、方便拖拽的副本。

## 自检三项

① 管理面板列表里有 "TankTrouble Network Optimization" 且开关 **ON**；② `tanktrouble.com` 上油猴图标出现数字角标 **1**；③ 按 **F12 → Console** 出现 `[TT NetLab vX.Y.Z] loaded...`。

## 新手常见疑问（看不懂先看这里）

- **这是浏览器扩展吗？要加到 chrome://extensions 吗？** — 不是。它是油猴脚本；先装 Tampermonkey（油猴），脚本是在油猴里安装，不要用“加载已解压的扩展程序”。
- **Tampermonkey 看着像可疑软件？** — Tampermonkey 是 Chrome/Edge/Firefox 上最常用的用户脚本管理器，只在官方商店安装（tampermonkey.net）；本项目开源在 GitHub，不用服务器、VPN 或改网络设置。
- **ZIP 解压后要把整个文件夹拖进去吗？** — 不用。方法 A 根本不需要 ZIP：只要下载单个文件 `tanktrouble-netlab.install.user.js`（第 2 步），把它从「下载」文件夹拖进油猴管理面板即可。整个文件夹不是脚本，装不上。
- **油猴的「管理面板 / Dashboard」在哪？怎么打开？** — 点浏览器工具栏的 **Tampermonkey 图标** → **管理面板 / Dashboard**。看不到图标就点拼图（扩展）按钮，把 Tampermonkey 固定出来。如果你已经在别的 Tampermonkey 页面，点左侧的「**已安装脚本 / Installed scripts**」回到列表页。⚠️ 不要点菜单里的「**添加新脚本**」——那打开的是编辑器，不是安装入口。
- **我点了「添加新脚本」，出来一个编辑器——这是安装入口吗？** — 不是。「添加新脚本」打开的是 Tampermonkey 的**编辑器**，用来写新脚本，不是安装这个脚本的地方。安装入口是**管理面板**的列表页（「已安装脚本」）：把下载好的 `tanktrouble-netlab.install.user.js` 拖到这个页面上，或者用 **管理面板 → 实用工具 / Utilities → Install from URL** 并粘贴 `https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js`。
- **打开下载链接只看到一屏代码 / Chrome 提示不能从此网站安装。** — 方法 A 里这是正常的——这个链接就是用来把文件存到本地的（去「下载」文件夹找 `tanktrouble-netlab.install.user.js`），然后把文件拖到油猴**管理面板**的列表页上。如果文件没有下载，右键链接 →「链接另存为…」，或用 **管理面板 → Utilities → Install from URL** 粘贴同一个链接。
- **把文件拖进去没反应？** — 要拖到油猴**管理面板**的列表页面上（不是 chrome://extensions，也不是普通网页），并让这个页面保持打开、在最前面。拖拽被拦时，用 **管理面板 → Utilities → Install from URL** 粘贴下载链接。
- **装完游戏里没看到东西？** — 用 Ctrl+F5 强制刷新游戏页；确认油猴管理面板里脚本开关是开启的；按 Ctrl+Shift+L 显示 HUD。安装前就打开的页面必须刷新。
- **装完还需要留着 ZIP/文件夹吗？** — 不需要。脚本已经进油猴了，ZIP 和文件夹可以删；以后在油猴里更新或重新打开 raw 链接安装即可。
- **油猴里的“从文件导入”/“添加文件”是在那里上传吗？** — 不是。那个按钮是给 Tampermonkey 备份 `.zip` 用的。安装这个脚本请用 Dashboard → 实用工具 → 从 URL 安装，或把单个 `.user.js` 文件拖到 Dashboard。
- **.user.js 需要改名、编辑或再解压吗？** — 不需要，原样使用即可。它本身就是脚本文本；不要放进 `chrome://extensions`，也不要上传整个文件夹。
- **我点了一键安装链接（方法 B），到底装上了没有？** — 如果成功，**Tampermonkey 会打开它自己的安装页**：深色页面，显示脚本名 "TankTrouble Network Optimization"、版本号，以及一个 **Install** 按钮——点 **Install** 才算装好。如果你看到的是满屏代码（以 `// ==UserScript==` 开头）、或者文件只是被下载了，那说明这次点击没有交给 Tampermonkey：请回到**方法 A**，把下载好的 `tanktrouble-netlab.install.user.js` 拖到 **管理面板** 页面上，或用 **管理面板 → Utilities → Install from URL**。
- **怎么确认它真的装上了、而且在运行？** — 三个检查：① Tampermonkey **Dashboard** 的脚本列表里能看到 “TankTrouble Network Optimization”，并且开关是 **ON**；② 在 `tanktrouble.com` 页面上，Tampermonkey 图标上会出现数字角标（**1**）；③ 按 **F12 → Console**，应看到一行 `[TT NetLab vX.Y.Z] loaded...`。如果 ③ 没有：先用 **Ctrl+F5** 重新加载页面；仍然没有就说明脚本被禁用或只装了一部分（**重装**，注意文件必须从第 1 行 `// ==UserScript==` 开始，从 `(function () {` 之类的中段开始复制是无效的）。

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

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [TECHNICAL.zh.md (中文)](TECHNICAL.zh.md)

<p align="right"><sub>[🇬🇧 English](en.md) · <b>🇨🇳 中文</b> · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>
