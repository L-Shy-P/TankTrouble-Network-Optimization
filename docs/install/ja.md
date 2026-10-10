# インストール手順

> 🇯🇵 **TankTrouble ネットワーク最適化** — より豊富・よりリアルタイム・より正確な回線表示と、実際の最適化。

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · <b>🇯🇵 日本語</b> · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ワンクリックインストール

[![Install](https://img.shields.io/badge/install-ja-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

上のボタン（または下の URL）を開く → Tampermonkey のインストール画面が開く → **インストール**：

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## 手順

1. **Tampermonkey を入れる**

   Chrome/Edge は [Chrome ウェブストア](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)、Firefox は [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) を開き、「ブラウザに追加」→「拡張機能を追加」。

2. **開発者モードを有効化（Chrome/Edge のみ）**

   `chrome://extensions`（または `edge://extensions`）を開き、右上の**開発者モード**をオンにします。

3. **スクリプトをインストール**

   下の**スクリプトをインストール**をクリック → Tampermonkey の画面で**インストール**。

4. **ゲームを開く**

   <https://tanktrouble.com/game> で対戦に入ると、左上にパネルが出ます。

5. **使い方**

   タイトルバーをドラッグで移動。左上の点をクリックするとボールに折りたたまれ（平均 / リアルタイム / 安定度）、ボールをクリックで展開。`Ctrl+Shift+S` 最適化、`Ctrl+Shift+L` HUD 表示切替、`Ctrl+Shift+E` レポート出力。

## ショートカット

| Key | |
|---|---|
| `Ctrl+Shift+S` | ネットワーク最適化のオン/オフ（A/B 比較） |
| `Ctrl+Shift+L` | HUD の表示 / 非表示 |
| `Ctrl+Shift+E` | 診断レポートを出力（クリップボードにもコピー） |
| `Ctrl+Shift+P` | 7 つの地域サーバーを測定して順位付け |

パネルの **⚡** は `Ctrl+Shift+S` と同じです。パネルでは **10 言語**から選べ、言語・最適化スイッチ・ボール位置は `localStorage` に保存されます。

## よくある質問

- **何も出ない** — URL が `*://*.tanktrouble.com/*` に一致し、スクリプトが有効か確認して `Ctrl+F5`。
- **パネルが消えた** — `Ctrl+Shift+L`。位置と折りたたみ状態は記憶されています。
- **まだ重い** — それは回線の問題です。`Ctrl+Shift+E` でレポートを出して地域を比較してください。

## リンク

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [日本語](../README.ja.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
