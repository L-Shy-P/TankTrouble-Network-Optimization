# 🇰🇷 TankTrouble 네트워크 최적화

> 더 풍부하고, 더 실시간이며, 더 정확한 네트워크 표시와 실제 최적화.

**tanktrouble.com**용 Tampermonkey 사용자 스크립트입니다. 회선 상태를 있는 그대로 보여주고, TCP 헤드오브라인 블로킹으로 생기는 "멈춤 → 순간이동"을 부드러운 이동으로 바꿉니다.

**서버 불필요, 네트워크 설정 불필요, VPN 아님.** 순수 클라이언트이며 서버가 보는 데이터는 1바이트도 바뀌지 않습니다.

최적화가 바꾸는 것은 *보이는 것*뿐입니다. 렌더링 순간의 위치만 부드럽게 하고, 게임 로직·물리·서버 검증은 항상 실제 값을 씁니다. 내 탱크는 로컬 기준이라 재접속해도 끌려가지 않습니다.

## 원클릭 설치 · Features

| | |
|---|---|
| 풍부 | 회선 / 평균 / 실시간 / 최대 / 지터 / 스톨 / 안정도를 실시간 표시 |
| 실시간 | 2초 간격 전용 ping 프로브로 실제 RTT 측정 |
| 정확 | "진짜 스톨(헤드오브라인 블로킹)"과 "로비/라운드 사이 유휴"를 분리 |
| 최적화 | 렌더링 시점 보간 + 로컬 권위 + 데드레코닝, A/B 스위치 포함 |

## 원클릭 설치

👉 **[설치 안내](install/ko.md)** · [⬇ raw script](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

## 링크

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [설치 안내](install/ko.md) · [Technical notes (中文)](TECHNICAL.zh.md)

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · <b>🇰🇷 한국어</b> · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md)</sub></p>
