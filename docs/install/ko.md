# 설치 안내

> 🇰🇷 **TankTrouble 네트워크 최적화** — 더 풍부하고, 더 실시간이며, 더 정확한 네트워크 표시와 실제 최적화.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · <b>🇰🇷 한국어</b> · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ 브라우저 확장 프로그램이 아니라 유저스크립트입니다

먼저 유저스크립트 관리 도구 **Tampermonkey**를 설치하세요. Chrome의 “압축해제된 확장 프로그램 로드”/확장 프로그램 페이지로는 설치할 수 없습니다. `.user.js`는 Tampermonkey가 관리합니다.

## 방법 A — 원클릭 설치 (권장)

[![Install](https://img.shields.io/badge/install-ko-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Tampermonkey 설치 후 위 배지나 아래 URL을 엽니다. Tampermonkey 설치 페이지가 뜨면 **설치**를 누르세요.

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## 방법 B — 다운로드한 ZIP으로 설치

1. **ZIP 다운로드**

   [GitHub 저장소](https://github.com/L-Shy-P/TankTrouble-Network-Optimization)에서 **Code → Download ZIP** 클릭.
2. **압축 해제**

   ZIP을 일반 폴더에 압축 해제합니다.
3. **Tampermonkey 설치**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → Chrome에 추가. 이후 `chrome://extensions`에서 **개발자 모드**를 켭니다. Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → Firefox에 추가.
4. **스크립트 불러오기**

   툴바의 Tampermonkey 아이콘 → **대시보드**. 압축을 푼 `tanktrouble-netlab.install.user.js`를 대시보드로 끌어다 놓고, 나타난 화면에서 **설치** 클릭.
5. **게임 페이지 새로고침**

   <https://tanktrouble.com/game>을 엽니다(이미 열려 있으면 새로고침). 좌측 상단에 공이 나타나면 클릭해 펼치고 바로 사용할 수 있습니다.

드래그가 안 되면: 위 원클릭 URL을 사용하거나 Tampermonkey 대시보드의 유틸리티에서 파일을 가져오세요. `tanktrouble-netlab.user.js`도 같은 내용이며 `install.user.js`는 드래그용 BOM 복사본입니다.

## 단축키

| Key | |
|---|---|
| `Ctrl+Shift+S` | 네트워크 최적화 켜기/끄기 (실시간 A/B) |
| `Ctrl+Shift+L` | HUD 숨기기 / 표시 |
| `Ctrl+Shift+E` | 진단 보고서 내보내기(클립보드에도 복사) |
| `Ctrl+Shift+P` | 7개 지역 서버를 측정해 순위 표시 |

패널의 **⚡** 버튼은 `Ctrl+Shift+S`와 같습니다. 패널에서 **11개 언어**를 고를 수 있고, 언어·최적화 스위치·공 위치는 `localStorage`에 저장됩니다.

## 초보자 FAQ (헷갈리면 여기부터)

- **이거 크롬 확장인가요? chrome://extensions에 넣나요?** — 아니요, 유저스크립트입니다. 먼저 Tampermonkey를 설치하고 그 안에 스크립트를 설치하세요. '압축해제된 확장 프로그램 로드'는 사용하지 않습니다.
- **Tampermonkey가 수상해 보여요.** — Chrome/Edge/Firefox에서 가장 많이 쓰는 유저스크립트 관리 도구이며 공식 스토어(tampermonkey.net)에서 설치합니다. 이 프로젝트는 GitHub 오픈소스이고 서버/VPN/네트워크 설정이 필요 없습니다.
- **ZIP을 풀면 폴더째 넣어야 하나요?** — 아니요. `tanktrouble-netlab.install.user.js` 파일 하나만 Tampermonkey 대시보드에 끌어다 놓으세요. 폴더째로는 설치되지 않습니다.
- **Tampermonkey 대시보드는 어떻게 열어요?** — 툴바의 Tampermonkey 아이콘 → 대시보드. 아이콘이 안 보이면 퍼즐/확장 버튼에서 Tampermonkey를 고정하세요.
- **raw 링크가 코드로 보여요 / 이 사이트에서는 추가할 수 없다고 해요.** — Tampermonkey 설치 후 raw 링크를 열면 Tampermonkey 설치 화면이 뜹니다. 안 뜨면 URL을 복사해 대시보드 → 유틸리티 → URL에서 설치를 사용하세요.
- **파일을 끌어도 반응이 없어요.** — Tampermonkey 대시보드 페이지에 놓아야 합니다(chrome://extensions나 일반 웹페이지 아님). 막히면 원클릭 링크나 'URL에서 설치'를 쓰세요.
- **설치했는데 게임에 아무것도 안 보여요.** — 게임 페이지에서 Ctrl+F5로 새로고침하세요. 대시보드에서 스크립트가 켜져 있는지 확인하고 Ctrl+Shift+L로 HUD를 표시하세요. 설치 전에 열어둔 페이지는 새로고침해야 합니다.
- **설치 후 ZIP/폴더를 남겨야 하나요?** — 아니요. 스크립트는 Tampermonkey 안에 있습니다. ZIP은 삭제해도 됩니다. 업데이트는 Tampermonkey나 raw 링크 재설치로 하세요.
- **Tampermonkey의 '파일에서 가져오기'/'Add file'에 올려야 하나요?** — 아니요, 그 버튼은 Tampermonkey 백업 `.zip`용입니다. 이 스크립트는 Dashboard → 유틸리티 → URL에서 설치를 쓰거나 `.user.js` 파일 하나를 Dashboard로 끌어다 놓으세요.
- **.user.js를 이름 바꾸거나 편집/재압축해야 하나요?** — 아니요, 그대로 사용하세요. 파일 자체가 스크립트입니다. `chrome://extensions`에 넣거나 폴더째 업로드하지 마세요.
## 문제 해결

- **아무것도 안 보임** — URL이 `*://*.tanktrouble.com/*`인지, 스크립트가 켜져 있는지 확인 후 `Ctrl+F5`.
- **패널이 사라짐** — `Ctrl+Shift+L`. 위치와 접힘 상태는 기억됩니다.
- **여전히 버벅임** — 회선 문제입니다. `Ctrl+Shift+E`로 보고서를 내보내 지역을 비교하세요.

## 링크

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [한국어](../README.ko.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
