# 🇬🇧 TankTrouble Network Optimization

![TankTrouble Network Optimization](img/v053/en.png?v=0.5.3)


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

## One-click install

👉 **[Install tutorial](install/en.md)** · [⬇ raw script](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

## Links

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Install tutorial](install/en.md) · [Technical notes (中文)](TECHNICAL.zh.md)

<p align="right"><sub><b>🇬🇧 English</b> · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>
