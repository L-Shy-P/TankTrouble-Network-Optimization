# 설치 안내

> 🇰🇷 **TankTrouble 네트워크 최적화** — 더 풍부하고, 더 실시간이며, 더 정확한 네트워크 표시와 실제 최적화.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · <b>🇰🇷 한국어</b> · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md)</sub></p>

## 원클릭 설치

[![Install](https://img.shields.io/badge/install-ko-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

위 버튼(또는 아래 URL)을 열면 → Tampermonkey 설치 화면이 뜹니다 → **설치**를 누르세요:

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## 단계

1. **Tampermonkey 설치**

   Chrome/Edge는 [Chrome 웹스토어](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), Firefox는 [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/)에서 "브라우저에 추가" → "확장 프로그램 추가".

2. **개발자 모드 켜기 (Chrome/Edge)**

   `chrome://extensions`(또는 `edge://extensions`)에서 우측 상단 **개발자 모드**를 켭니다.

3. **스크립트 설치**

   아래 **스크립트 설치**를 누르고 Tampermonkey 화면에서 **설치**.

4. **게임 열기**

   <https://tanktrouble.com/game>에서 경기에 들어가면 좌측 상단에 패널이 나타납니다.

5. **사용법**

   제목 표시줄을 끌어 이동. 좌측 상단 점을 클릭하면 공으로 접히고(평균 / 실시간 / 안정도), 공을 클릭하면 펼쳐집니다. `Ctrl+Shift+S` 최적화, `Ctrl+Shift+L` HUD 숨기기, `Ctrl+Shift+E` 보고서 내보내기.

## 단축키

| Key | |
|---|---|
| `Ctrl+Shift+S` | 네트워크 최적화 켜기/끄기 (실시간 A/B) |
| `Ctrl+Shift+L` | HUD 숨기기 / 표시 |
| `Ctrl+Shift+E` | 진단 보고서 내보내기(클립보드에도 복사) |
| `Ctrl+Shift+P` | 7개 지역 서버를 측정해 순위 표시 |

패널의 **⚡** 버튼은 `Ctrl+Shift+S`와 같습니다. 패널에서 **10개 언어**를 고를 수 있고, 언어·최적화 스위치·공 위치는 `localStorage`에 저장됩니다.

## 문제 해결

- **아무것도 안 보임** — URL이 `*://*.tanktrouble.com/*`인지, 스크립트가 켜져 있는지 확인 후 `Ctrl+F5`.
- **패널이 사라짐** — `Ctrl+Shift+L`. 위치와 접힘 상태는 기억됩니다.
- **여전히 버벅임** — 회선 문제입니다. `Ctrl+Shift+E`로 보고서를 내보내 지역을 비교하세요.

## 링크

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [한국어](../README.ko.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
