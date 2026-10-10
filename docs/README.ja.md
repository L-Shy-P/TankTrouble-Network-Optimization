# 🇯🇵 TankTrouble ネットワーク最適化

> [!TIP]
> TankTrouble で **日本語** を送りたい？多言語チャット拡張を作りました！👉 [TankTrouble-Chat-Unblock](https://github.com/L-Shy-P/TankTrouble-Chat-Unblock)




![TankTrouble ネットワーク最適化](img/v051/ja.png?v=0.5.1)


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

## ワンクリックインストール

👉 **[インストール手順](install/ja.md)** · [⬇ raw script](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

## リンク

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [インストール手順](install/ja.md) · [Technical notes (中文)](TECHNICAL.zh.md)

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · <b>🇯🇵 日本語</b> · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md)</sub></p>

