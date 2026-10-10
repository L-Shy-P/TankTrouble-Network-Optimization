# 🇯🇵 TankTrouble ネットワーク最適化

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · <b>🇯🇵 日本語</b> · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

<img src="img/v053/panel-ja.png" width="440" alt="panel"> <img src="img/v053/ball-ja.png" width="150" alt="floating ball">

> より豊富・よりリアルタイム・より正確な回線表示と、実際の最適化。

**tanktrouble.com** 用の Tampermonkey ユーザースクリプト。回線の実情を表示し、TCP の隊頭ブロッキングによる「固まる → ワープ」を滑らかな移動に変えます。

**サーバー不要・ネットワーク設定不要・VPN ではありません。** 完全にクライアント側で、サーバーが見るデータは 1 バイトも変わりません。

最適化が変えるのは*見た目だけ*：描画の瞬間だけ位置を滑らかにし、ゲームロジック・物理・サーバー検証は常に真値を使います。自分の戦車はローカル優先なので、再接続後も引き戻されません。

## ワンクリックインストール · Features

| | |
|---|---|
| 豊富 | 回線 / 平均 / リアルタイム / 最大 / ジッター / スタール / 安定度をリアルタイム表示 |
| リアルタイム | 独立した 2 秒間隔の ping プローブで真の RTT を測定 |
| 正確 | 「本当のスタール（隊頭ブロッキング）」と「ロビー/ラウンド間のアイドル」を分離 |
| 最適化 | 描画時補間 + ローカル権威 + デッドレコニング、A/B スイッチ付き |

## ⚠️ これはブラウザ拡張ではなくユーザースクリプトです

先にユーザースクリプト管理ツール **Tampermonkey** を入れてください。`chrome://extensions` / 「パッケージ化されていない拡張機能を読み込む」は使いません。`.user.js` は Tampermonkey が管理します。コードが一面に表示されたら入口を間違えています。この手順に戻ってください。

## 方法 A — ダウンロードしたファイルを Tampermonkey の「ダッシュボード / Dashboard」にドラッグ（推奨・いちばん簡単）

### ステップ 1（最初の一度だけ）— Tampermonkey をインストール

Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → **Chrome に追加**。Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → **Firefox に追加**。

インストール後、ツールバーに Tampermonkey アイコンが見えない場合：ブラウザ右上の**パズル / 拡張機能**ボタンをクリックし、**Tampermonkey** をピン留め（Pin）します。

### ステップ 2 — スクリプトファイルをダウンロード

**[⬇ Download](https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js)** をクリック（または下のリンクを開く）すると、ブラウザがファイルを「ダウンロード」フォルダに `tanktrouble-netlab.install.user.js` という名前で保存します。

**名前変更・解凍・編集はしないでください**——ただのテキストスクリプトです。

```
https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js
```

### ステップ 3 — Tampermonkey の「ダッシュボード / Dashboard」を開く（多くの人がここで詰まります）

ブラウザのツールバーにある **Tampermonkey アイコン**をクリック → 表示されたメニューで **ダッシュボード / Dashboard** をクリック。

- アイコンが見つからない：**パズル / 拡張機能**ボタンをクリックしてから Tampermonkey をクリック。
- ⚠️ メニューの「**新規スクリプトを追加**」は**エディター**を開くだけで、インストールの入口ではありません。**ダッシュボード**（中国語 UI では「管理面板」）を使ってください。
- すでに別の Tampermonkey ページにいる場合は、左側の「**インストール済みスクリプト / Installed scripts**」をクリックして一覧に戻ります。

### ステップ 4 — ファイルをドラッグして入れる

**ダッシュボードの一覧ページ**を開いたまま、「ダウンロード」フォルダの `tanktrouble-netlab.install.user.js` を**ダッシュボードのページへドラッグ** → Tampermonkey のインストール画面（暗いページにスクリプト名 "TankTrouble Network Optimization"・バージョン・**Install** ボタン）が出る → **Install** をクリック。

- ドラッグが効かない場合：**ダッシュボード → ユーティリティ / Utilities → Install from URL** で同じダウンロードリンクを貼り付け、**Install** をクリック。
- 下の**方法 B**のワンクリックリンクを直接クリックしてもかまいません。Tampermonkey 導入済みならインストール画面が直接開きます。`// ==UserScript==` で始まるコードが一面に出たら Tampermonkey に届いていません → 上のドラッグ法に戻ってください。

### ステップ 5 — ゲームに入る

<https://tanktrouble.com/game> を開く → **Ctrl + F5** で強制再読み込み → 左上にパネルまたはボールが表示されます。見えない場合は **Ctrl + Shift + L** を押してください（隠れているだけかもしれません）。

## 方法 B — ワンクリックインストール（Tampermonkey 導入済みの場合）

[![Install](https://img.shields.io/badge/install-ja-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Tampermonkey 導入済みなら、上のボタン（または下のリンク）をクリックすると、Tampermonkey 自身のインストール画面が直接開きます——暗いページにスクリプト名 "TankTrouble Network Optimization"・バージョン・**Install** ボタンが表示され、**Install** を押して初めてインストール完了です。`// ==UserScript==` で始まるコードが一面に表示されたら、このクリックは Tampermonkey に届いていません → **方法 A** のドラッグ法に戻ってください。

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## 方法 C — ダウンロードした ZIP からインストール（オフライン）

すでにドラッグでインストールできるなら、**方法 A だけで十分で、ZIP は不要です**。リポジトリ全体をオフラインで保存したい場合だけ ZIP を使ってください。

1. **ZIP をダウンロード**

   [GitHub リポジトリ](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) で **Code → Download ZIP** をクリック。
2. **解凍する**

   ZIP を普通のフォルダに解凍します。
3. **Tampermonkey が入っていることを確認**

   まだなら方法 A のステップ 1 に戻ってください。`chrome://extensions` は使わないでください。
4. **スクリプトを読み込む**

   Tampermonkey アイコン → **ダッシュボード**をクリックし、一覧ページを開いたまま、解凍した `tanktrouble-netlab.install.user.js` をダッシュボードのページへドラッグし、表示された画面で **Install** を押します。ドラッグできない場合は **ダッシュボード → Utilities → Install from URL** を使います。
5. **ゲームページを更新**

   <https://tanktrouble.com/game> を開く（開いていたら更新）。左上にボールが表示されたら、クリックして展開すれば使い始められます。

`tanktrouble-netlab.user.js` も同内容、`install.user.js` はドラッグ用の BOM 付きコピーです。

## セルフチェック（3 つ）

① ダッシュボードの一覧に "TankTrouble Network Optimization" があり、スイッチが **ON**；② `tanktrouble.com` 上の Tampermonkey アイコンに数字のバッジ **1** が出る；③ **F12 → Console** を開くと `[TT NetLab vX.Y.Z] loaded...` が出る。

## 初心者向け FAQ（わからない人はここ）

- **これは Chrome 拡張ですか？chrome://extensions に入れますか？** — いいえ、ユーザースクリプトです。先に Tampermonkey を入れ、その中にインストールします。「パッケージ化されていない拡張機能を読み込む」は使いません。
- **Tampermonkey は怪しいアプリ？** — Chrome/Edge/Firefox で最も使われているユーザースクリプト管理ツールで、公式ストア（tampermonkey.net）から入れます。このプロジェクトは GitHub で公開、サーバー/VPN/ネットワーク設定は不要です。
- **ZIP を解凍したらフォルダごと入れますか？** — いいえ。方法 A では ZIP は不要です：単一ファイル `tanktrouble-netlab.install.user.js` だけをダウンロードし（ステップ 2）、「ダウンロード」フォルダから Tampermonkey ダッシュボードにその 1 ファイルだけをドラッグします。フォルダごとではインストールできません。
- **Tampermonkey のダッシュボードはどこ？どう開く？** — ブラウザのツールバーの **Tampermonkey アイコン** → **ダッシュボード / Dashboard**。見えない場合はパズル/拡張ボタンから Tampermonkey をピン留めします。すでに別の Tampermonkey ページにいる場合は、左側の「**インストール済みスクリプト / Installed scripts**」をクリックして一覧に戻ります。⚠️ メニューの「**新規スクリプトを追加**」は使わないでください——開くのはエディターで、インストールの入口ではありません。
- **「新規スクリプトを追加」を押したらエディターが出ました。これがインストール入口ですか？** — いいえ。「新規スクリプトを追加」は Tampermonkey の**エディター**を開くだけで、このスクリプトをインストールする場所ではありません。インストール入口は**ダッシュボード**の一覧ページ（「インストール済みスクリプト」）です：ダウンロードした `tanktrouble-netlab.install.user.js` をこのページにドラッグするか、**ダッシュボード → ユーティリティ / Utilities → Install from URL** で `https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js` を貼り付けてください。
- **ダウンロードリンクを開くとコードが表示される / このサイトからはインストールできないと言われる。** — 方法 A では正常です——このリンクはファイルを保存するためのものです（「ダウンロード」フォルダの `tanktrouble-netlab.install.user.js` を確認）。その後、そのファイルを Tampermonkey **ダッシュボード**の一覧ページにドラッグしてください。ファイルが保存されない場合は、リンクを右クリック →「リンク先を別名で保存…」、または **ダッシュボード → Utilities → Install from URL** に同じリンクを貼り付けます。
- **ドラッグしても何も起きない。** — Tampermonkey **ダッシュボード**の一覧ページにドロップしてください（chrome://extensions や通常の Web ページではありません）。そのページを開いたまま最前面にしておきます。ドラッグがブロックされる場合は **ダッシュボード → Utilities → Install from URL** を使います。
- **入れたのにゲームに何も出ない。** — ゲームページで Ctrl+F5。ダッシュボードでスクリプトが有効か確認。Ctrl+Shift+L で HUD 表示。インストール前に開いていたページは再読み込みが必要です。
- **ZIP やフォルダは残す必要ある？** — 不要です。スクリプトは Tampermonkey 内に入っています。ZIP は削除可。更新は Tampermonkey か raw リンク再インストールで。
- **Tampermonkey の「ファイルからインポート」/「Add file」にアップロードする？** — いいえ、それは Tampermonkey のバックアップ `.zip` 用です。このスクリプトは Dashboard → ユーティリティ → URL からインストール、または `.user.js` 1 ファイルを Dashboard にドラッグしてください。
- **.user.js を名前変更・編集・再解凍する必要は？** — 不要です。そのまま使ってください。ファイル自体がスクリプト本文です。`chrome://extensions` に入れたり、フォルダごとアップロードしないでください。
- **ワンクリックインストールリンク（方法 B）を押したけど、ちゃんとインストールされた？** — 成功すると、**Tampermonkey 自身のインストール画面**が開きます：暗いページにスクリプト名 "TankTrouble Network Optimization"、バージョン、**Install** ボタンが表示され、**Install** を押して初めてインストール完了です。逆に `// ==UserScript==` から始まるコードが一面に表示されたり、ファイルがダウンロードされただけなら、このクリックは Tampermonkey に届いていません：**方法 A** に戻り、ダウンロードした `tanktrouble-netlab.install.user.js` を **ダッシュボード**にドラッグするか、**ダッシュボード → Utilities → Install from URL** を使ってください。
- **ちゃんとインストールされて動作しているか確認するには？** — 確認は 3 つです：① Tampermonkey **Dashboard** のスクリプト一覧に「TankTrouble Network Optimization」があり、スイッチが **ON**；② `tanktrouble.com` のページで Tampermonkey アイコンに数字のバッジ（**1**）が出る；③ **F12 → Console** を開くと `[TT NetLab vX.Y.Z] loaded...` の行が出る。③ が出ない場合：まず **Ctrl+F5** でページを再読み込みしてください。それでも出なければ、スクリプトが無効か一部しかインストールされていません（**再インストール**。ファイルは必ず 1 行目の `// ==UserScript==` から始まる必要があり、`(function () {` のような途中からコピーしても無効です）。

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

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [TECHNICAL.zh.md (中文)](TECHNICAL.zh.md)

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · <b>🇯🇵 日本語</b> · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>
