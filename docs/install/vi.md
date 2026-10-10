# Hướng dẫn cài đặt

> 🇻🇳 **TankTrouble — tối ưu hóa mạng** — Hiển thị mạng phong phú hơn, thời gian thực hơn và chính xác hơn — kèm tối ưu hóa thật sự.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · <b>🇻🇳 Tiếng Việt</b></sub></p>

## Cài đặt một cú nhấp

[![Install](https://img.shields.io/badge/install-vi-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Nhấp vào badge (hoặc mở URL bên dưới) → Tampermonkey mở trang cài đặt → nhấn **Cài đặt**:

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Các bước

1. **Cài Tampermonkey**

   Chrome/Edge: mở [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo). Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/). Nhấn *Thêm vào trình duyệt* → *Thêm tiện ích*.
2. **Bật chế độ nhà phát triển (chỉ Chrome/Edge)**

   Mở `chrome://extensions` (hoặc `edge://extensions`) và bật **Chế độ nhà phát triển** ở góc trên bên phải. Chrome gần đây yêu cầu bật để cài userscript.
3. **Cài script**

   Nhấn **Cài đặt script** bên dưới — Tampermonkey mở trang cài đặt. Nhấn **Cài đặt**.
4. **Mở game**

   Vào <https://tanktrouble.com/game> và tham gia một ván. Bảng điều khiển xuất hiện ở góc trên bên trái.
5. **Cách dùng**

   Kéo thanh tiêu đề để di chuyển. Nhấp vào chấm tròn để thu gọn thành bóng (trung bình / ping hiện tại / ổn định); nhấp vào bóng để mở rộng. `Ctrl+Shift+S` bật/tắt tối ưu hóa, `Ctrl+Shift+L` ẩn HUD, `Ctrl+Shift+E` xuất báo cáo.

## Phím tắt

| Phím | |
|---|---|
| `Ctrl+Shift+S` | bật/tắt tối ưu hóa mạng (so sánh A/B trực tiếp) |
| `Ctrl+Shift+L` | ẩn / hiện HUD |
| `Ctrl+Shift+E` | xuất báo cáo chẩn đoán (đồng thời sao chép vào clipboard) |
| `Ctrl+Shift+P` | dò 7 khu vực máy chủ và xếp hạng |

Nút **⚡** trong bảng tương đương `Ctrl+Shift+S`. Bảng cho chọn một trong **11 ngôn ngữ**; ngôn ngữ, công tắc tối ưu và vị trí bóng được lưu trong `localStorage`.

## Khắc phục sự cố

- **Không thấy gì xuất hiện** — Kiểm tra URL khớp `*://*.tanktrouble.com/*` và script đang bật, sau đó nhấn `Ctrl+F5`.
- **Bảng điều khiển biến mất** — Nhấn `Ctrl+Shift+L`. Vị trí và trạng thái thu gọn được ghi nhớ.
- **Vẫn bị giật** — Đó là do tuyến mạng của bạn, không phải script. Xuất báo cáo (`Ctrl+Shift+E`) và so sánh các khu vực trong bảng.

## Liên kết

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Tiếng Việt](../README.vi.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
