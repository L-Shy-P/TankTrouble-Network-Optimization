# 发布清单（推送到 GitHub 前看这里）

## 1. 仓库描述（Repo description）

GitHub 仓库页右上角 "About" → 齿轮 → Description：

**推荐（中英双语，≤ 350 字符）：**

```
更丰富、更实时、更准确的网络显示 + 真正的网络优化。Richer, more real-time and more accurate network display — plus real optimization. Tampermonkey userscript, no server / no network config / not a VPN.
```

**Topics（标签，逐个粘贴）：**

```
tanktrouble  userscript  tampermonkey  network  latency  optimization  websocket  ping  diagnostics  chinese  i18n
```

**Website 字段可以留空，或填油猴安装地址：**

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## 2. 首次推送

```bash
cd "TT Network Optimization"
git add -A
git commit -m "TankTrouble Network Optimization v0.3.8: 10-language HUD, real-RTT metrics, render-time smoothing"
git branch -M main
git remote add origin https://github.com/L-Shy-P/TankTrouble-Network-Optimization.git
git push -u origin main
```

> 如果仓库是用 GitHub 网页新建的并且带了 README，先 `git pull --rebase origin main` 再 push。

## 3. 之后每次发版

1. 改脚本里的 `VERSION` 与 `CHANGELOG`（有测试守着一致性）；
2. `node ttn-smoke-test.js`（全绿）+ 无头浏览器跑 `_ui_check.html`（全绿）；
3. 重新生成安装副本：把 `tanktrouble-netlab.user.js` 存成 **UTF-8 BOM** 的
   `tanktrouble-netlab.install.user.js`（拖拽安装用）；
4. `git commit -am "vX.Y.Z: ..." && git push`；
5. 到仓库 **Releases → Draft a new release**，Tag 填 `vX.Y.Z`，把 `CHANGELOG` 里那几条粘上去，
   附件可选上传 `.user.js`。

## 4. 仓库文件说明

| 路径 | 说明 |
|---|---|
| `README.md` | 仓库主页：只放**多语言介绍** + 语言/教程跳转（用户要求） |
| `docs/README.<lang>.md` | 各语言的介绍页（10 国） |
| `docs/install/<lang>.md` | 各语言的**从安装油猴开始**的安装教程（10 国） |
| `docs/TECHNICAL.zh.md` | 技术原理 / 实测结论 / 踩坑记录（中文） |
| `tanktrouble-netlab.user.js` | 主脚本（油猴直接安装这个） |
| `tanktrouble-netlab.install.user.js` | 同一份内容 + UTF-8 BOM（拖拽安装用） |
| `ttn-smoke-test.js` | 逻辑测试（vm 沙盒，303 项） |
| `ui-check-build.js` + `_ui_harness.js` | 生成浏览器交互测试页（190 项） |
| `LICENSE` | MIT |
