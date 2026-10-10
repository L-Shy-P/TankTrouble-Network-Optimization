# インストール手順

> 🇯🇵 **TankTrouble ネットワーク最適化** — より豊富・よりリアルタイム・より正確な回線表示と、実際の最適化。

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · <b>🇯🇵 日本語</b> · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ これはブラウザ拡張ではなくユーザースクリプトです

先にユーザースクリプト管理ツール **Tampermonkey** を入れてください。Chrome の「パッケージ化されていない拡張機能を読み込む」/拡張機能ページではインストールできません。`.user.js` は Tampermonkey が管理します。

## 方法 A — ワンクリックインストール（推奨）

[![Install](https://img.shields.io/badge/install-ja-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Tampermonkey を入れたら、上のバッジか下の URL を開きます。Tampermonkey のインストール画面が出るので **インストール** を押します。

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## 方法 B — ダウンロードした ZIP からインストール

1. **ZIP をダウンロード**

   [GitHub リポジトリ](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) で **Code → Download ZIP** をクリック。
2. **解凍する**

   ZIP を普通のフォルダに解凍します。
3. **Tampermonkey をインストール**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → Chrome に追加。その後 `chrome://extensions` を開き**デベロッパーモード**をオン。Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → Firefox に追加。
4. **スクリプトを読み込む**

   ツールバーの Tampermonkey アイコン → **ダッシュボード**。解凍した `tanktrouble-netlab.install.user.js` をダッシュボードにドラッグし、表示された画面で **インストール** を押す。
5. **ゲームページを更新**

   <https://tanktrouble.com/game> を開く（開いていたら更新）。左上にボールが表示されたら、クリックして展開すれば使い始められます。

ドラッグできない場合：上のワンクリック URL を使うか、Tampermonkey ダッシュボードのユーティリティからファイルを読み込んでください。`tanktrouble-netlab.user.js` も同内容、`install.user.js` はドラッグ用の BOM 付きコピーです。

## ショートカット

| Key | |
|---|---|
| `Ctrl+Shift+S` | ネットワーク最適化のオン/オフ（A/B 比較） |
| `Ctrl+Shift+L` | HUD の表示 / 非表示 |
| `Ctrl+Shift+E` | 診断レポートを出力（クリップボードにもコピー） |
| `Ctrl+Shift+P` | 7 つの地域サーバーを測定して順位付け |

パネルの **⚡** は `Ctrl+Shift+S` と同じです。パネルでは **11 言語**から選べ、言語・最適化スイッチ・ボール位置は `localStorage` に保存されます。

## よくある質問

- **何も出ない** — URL が `*://*.tanktrouble.com/*` に一致し、スクリプトが有効か確認して `Ctrl+F5`。
- **パネルが消えた** — `Ctrl+Shift+L`。位置と折りたたみ状態は記憶されています。
- **まだ重い** — それは回線の問題です。`Ctrl+Shift+E` でレポートを出して地域を比較してください。

## リンク

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [日本語](../README.ja.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
