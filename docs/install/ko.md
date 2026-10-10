# 설치 안내

> 🇰🇷 **TankTrouble 네트워크 최적화** — 더 풍부하고, 더 실시간이며, 더 정확한 네트워크 표시와 실제 최적화.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · <b>🇰🇷 한국어</b> · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ 브라우저 확장 프로그램이 아니라 유저스크립트입니다

먼저 유저스크립트 관리 도구 **Tampermonkey**를 설치하세요. `chrome://extensions` / '압축해제된 확장 프로그램 로드'는 사용하지 않습니다. `.user.js`는 Tampermonkey가 관리합니다. 코드가 화면에 가득 보이면 잘못된 입구입니다 — 이 안내로 돌아오세요.

## 방법 A — 내려받은 파일을 Tampermonkey '대시보드 / Dashboard'로 끌어다 놓기 (권장, 가장 간단)

### 1단계 (최초 한 번만) — Tampermonkey 설치

Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → **Chrome에 추가**. Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → **Firefox에 추가**.

설치 후 툴바에 Tampermonkey 아이콘이 보이지 않으면: 브라우저 오른쪽 위의 **퍼즐 / 확장 프로그램** 버튼을 클릭한 뒤 **Tampermonkey**를 고정(Pin)하세요.

### 2단계 — 스크립트 파일 내려받기

**[⬇ Download](https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js)**를 클릭하세요(또는 아래 링크를 여세요). 브라우저가 파일을 '다운로드' 폴더에 `tanktrouble-netlab.install.user.js`라는 이름으로 저장합니다.

**이름을 바꾸거나 압축을 풀거나 편집하지 마세요** — 그냥 텍스트 스크립트입니다.

```
https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js
```

### 3단계 — Tampermonkey '대시보드 / Dashboard' 열기 (대부분 여기서 막힙니다)

브라우저 툴바의 **Tampermonkey 아이콘** 클릭 → 팝업 메뉴에서 **대시보드 / Dashboard** 클릭.

- 아이콘이 안 보이면: **퍼즐 / 확장 프로그램** 버튼을 클릭한 다음 Tampermonkey를 클릭하세요.
- ⚠️ 그 메뉴의 '**새 스크립트 추가**'는 **편집기**를 열 뿐 설치 입구가 아닙니다. **대시보드**(중국어 UI에서는 '管理面板')를 사용하세요.
- 이미 다른 Tampermonkey 페이지에 있다면 왼쪽의 '**설치된 스크립트 / Installed scripts**'를 클릭해 목록으로 돌아오세요.

### 4단계 — 파일을 끌어다 놓기

**대시보드 목록 페이지**를 연 상태에서 '다운로드' 폴더의 `tanktrouble-netlab.install.user.js`를 **대시보드 페이지 위로 끌어다 놓으세요** → Tampermonkey 설치 화면(어두운 페이지에 스크립트 이름 "TankTrouble Network Optimization", 버전, **Install** 버튼)이 뜹니다 → **Install** 클릭.

- 끌어다 놓기가 안 되면: **대시보드 → 유틸리티 / Utilities → Install from URL**에서 같은 다운로드 링크를 붙여넣고 **Install**을 클릭하세요.
- 아래 **방법 B**의 원클릭 링크를 직접 클릭해도 됩니다. Tampermonkey가 설치되어 있으면 설치 화면이 바로 열립니다. `// ==UserScript==`로 시작하는 코드가 화면에 가득 보이면 Tampermonkey에 전달되지 않은 것이므로 → 위의 끌어다 놓기 방법으로 돌아가세요.

### 5단계 — 게임 열기

<https://tanktrouble.com/game> 열기 → **Ctrl + F5**로 강력 새로고침 → 왼쪽 위에 패널 또는 떠 있는 공이 나타납니다. 안 보이면 **Ctrl + Shift + L**을 누르세요 — 숨겨져 있을 수 있습니다.

### 자체 점검(3가지)

① 대시보드 목록에 "TankTrouble Network Optimization"이 있고 스위치가 **ON**; ② `tanktrouble.com` 페이지에서 Tampermonkey 아이콘에 숫자 배지 **1** 표시; ③ **F12 → Console**을 열면 `[TT NetLab vX.Y.Z] loaded...`가 보입니다.

## 방법 B — 원클릭 설치 (Tampermonkey가 이미 설치된 경우)

[![Install](https://img.shields.io/badge/install-ko-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Tampermonkey가 설치되어 있으면 위 버튼(또는 아래 링크)을 클릭하세요: Tampermonkey가 자체 설치 화면을 엽니다 — 어두운 페이지에 스크립트 이름 "TankTrouble Network Optimization", 버전, **Install** 버튼이 보이고 **Install**을 눌러야 설치가 끝납니다. `// ==UserScript==`로 시작하는 코드가 화면에 가득 보이면 이 클릭은 Tampermonkey에 전달되지 않은 것이므로 → **방법 A**의 끌어다 놓기로 돌아가세요.

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## 방법 C — 내려받은 ZIP으로 설치 (오프라인)

이미 끌어다 놓기로 설치할 줄 안다면 **방법 A만으로 충분하며 ZIP은 필요 없습니다**. 저장소 전체를 오프라인으로 보관하고 싶을 때만 ZIP을 쓰세요.

1. **ZIP 다운로드**

   [GitHub 저장소](https://github.com/L-Shy-P/TankTrouble-Network-Optimization)에서 **Code → Download ZIP** 클릭.
2. **압축 해제**

   ZIP을 일반 폴더에 압축 해제합니다.
3. **Tampermonkey 설치 확인**

   아직 없다면 방법 A의 1단계로 돌아가세요. `chrome://extensions`는 사용하지 마세요.
4. **스크립트 불러오기**

   Tampermonkey 아이콘 → **대시보드**를 클릭하고 목록 페이지를 연 상태에서, 압축을 푼 `tanktrouble-netlab.install.user.js`를 대시보드 페이지 위로 끌어다 놓고 나타난 화면에서 **Install**을 클릭하세요. 끌어다 놓기가 안 되면 **대시보드 → Utilities → Install from URL**을 사용하세요.
5. **게임 페이지 새로고침**

   <https://tanktrouble.com/game>을 엽니다(이미 열려 있으면 새로고침). 좌측 상단에 공이 나타나면 클릭해 펼치고 바로 사용할 수 있습니다.

`tanktrouble-netlab.user.js`도 같은 내용이며 `install.user.js`는 끌어다 놓기용 BOM 복사본입니다.

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
- **ZIP을 풀면 폴더째 넣어야 하나요?** — 아니요. 방법 A에는 ZIP이 전혀 필요 없습니다: 단일 파일 `tanktrouble-netlab.install.user.js`만 내려받아(2단계) '다운로드' 폴더에서 Tampermonkey 대시보드로 그 파일 하나만 끌어다 놓으면 됩니다. 폴더째로는 설치되지 않습니다.
- **Tampermonkey 대시보드는 어디에 있고 어떻게 열죠?** — 브라우저 툴바의 **Tampermonkey 아이콘** → **대시보드 / Dashboard**. 아이콘이 안 보이면 퍼즐/확장 버튼에서 Tampermonkey를 고정하세요. 이미 다른 Tampermonkey 페이지에 있다면 왼쪽의 '**설치된 스크립트 / Installed scripts**'를 클릭해 목록으로 돌아오세요. ⚠️ 메뉴의 '**새 스크립트 추가**'는 사용하지 마세요 — 편집기를 열 뿐 설치 입구가 아닙니다.
- **'새 스크립트 추가'를 눌렀더니 편집기가 나왔어요. 여기가 설치 입구인가요?** — 아니요. '새 스크립트 추가'는 Tampermonkey **편집기**를 열 뿐이며, 이 스크립트를 설치하는 곳이 아닙니다. 설치 입구는 **대시보드** 목록 페이지('설치된 스크립트')입니다: 내려받은 `tanktrouble-netlab.install.user.js`를 이 페이지로 끌어다 놓거나, **대시보드 → 유틸리티 / Utilities → Install from URL**에서 `https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js`를 붙여넣으세요.
- **다운로드 링크를 열면 코드가 보여요 / Chrome이 이 사이트에서는 설치할 수 없다고 해요.** — 방법 A에서는 정상입니다 — 그 링크는 파일을 저장하기 위한 것입니다('다운로드' 폴더에서 `tanktrouble-netlab.install.user.js` 확인). 그다음 그 파일을 Tampermonkey **대시보드** 목록 페이지로 끌어다 놓으세요. 파일이 저장되지 않으면 링크를 오른쪽 클릭 → '다른 이름으로 링크 저장…'을 하거나, **대시보드 → Utilities → Install from URL**에 같은 링크를 붙여넣으세요.
- **파일을 끌어도 반응이 없어요.** — Tampermonkey **대시보드** 목록 페이지에 놓아야 합니다(chrome://extensions나 일반 웹페이지가 아님). 그 페이지를 열어 둔 채 앞에 두세요. 끌어다 놓기가 막히면 **대시보드 → Utilities → Install from URL**을 사용하세요.
- **설치했는데 게임에 아무것도 안 보여요.** — 게임 페이지에서 Ctrl+F5로 새로고침하세요. 대시보드에서 스크립트가 켜져 있는지 확인하고 Ctrl+Shift+L로 HUD를 표시하세요. 설치 전에 열어둔 페이지는 새로고침해야 합니다.
- **설치 후 ZIP/폴더를 남겨야 하나요?** — 아니요. 스크립트는 Tampermonkey 안에 있습니다. ZIP은 삭제해도 됩니다. 업데이트는 Tampermonkey나 raw 링크 재설치로 하세요.
- **Tampermonkey의 '파일에서 가져오기'/'Add file'에 올려야 하나요?** — 아니요, 그 버튼은 Tampermonkey 백업 `.zip`용입니다. 이 스크립트는 Dashboard → 유틸리티 → URL에서 설치를 쓰거나 `.user.js` 파일 하나를 Dashboard로 끌어다 놓으세요.
- **.user.js를 이름 바꾸거나 편집/재압축해야 하나요?** — 아니요, 그대로 사용하세요. 파일 자체가 스크립트입니다. `chrome://extensions`에 넣거나 폴더째 업로드하지 마세요.
- **원클릭 설치 링크(방법 B)를 눌렀는데 실제로 설치된 걸까요?** — 성공하면 **Tampermonkey가 자체 설치 화면을 엽니다**: 어두운 페이지에 스크립트 이름 "TankTrouble Network Optimization", 버전, **Install** 버튼이 보이고, **Install**을 눌러야 설치가 끝납니다. 반대로 `// ==UserScript==`로 시작하는 코드가 화면에 가득 보이거나 파일이 다운로드되기만 했다면 이 클릭은 Tampermonkey에 전달되지 않은 것입니다: **방법 A**로 돌아가 내려받은 `tanktrouble-netlab.install.user.js`를 **대시보드** 페이지로 끌어다 놓거나, **대시보드 → Utilities → Install from URL**을 사용하세요.
- **정말 설치되어 실행 중인지 어떻게 확인하나요?** — 확인 세 가지: ① Tampermonkey **Dashboard**의 스크립트 목록에 "TankTrouble Network Optimization"이 보이고 스위치가 **ON**; ② `tanktrouble.com` 페이지에서 Tampermonkey 아이콘에 숫자 배지(**1**)가 표시됨; ③ **F12 → Console**을 눌러 `[TT NetLab vX.Y.Z] loaded...` 줄이 보임. ③이 없으면: 먼저 **Ctrl+F5**로 페이지를 새로고침하세요. 그래도 없으면 스크립트가 비활성화되었거나 일부만 설치된 것입니다(**재설치**). 파일은 반드시 1번째 줄 `// ==UserScript==`부터 시작해야 하며, `(function () {` 같은 중간부터 복사하면 적용되지 않습니다.

## 문제 해결

- **아무것도 안 보임** — URL이 `*://*.tanktrouble.com/*`인지, 스크립트가 켜져 있는지 확인 후 `Ctrl+F5`.
- **패널이 사라짐** — `Ctrl+Shift+L`. 위치와 접힘 상태는 기억됩니다.
- **여전히 버벅임** — 회선 문제입니다. `Ctrl+Shift+E`로 보고서를 내보내 지역을 비교하세요.

## 링크

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [한국어](../README.ko.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
