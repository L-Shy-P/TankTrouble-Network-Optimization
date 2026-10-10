# Hướng dẫn cài đặt

> 🇻🇳 **TankTrouble — tối ưu hóa mạng** — Hiển thị mạng phong phú hơn, thời gian thực hơn và chính xác hơn — kèm tối ưu hóa thật sự.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · <b>🇻🇳 Tiếng Việt</b></sub></p>

## ⚠️ Đây là userscript — không phải tiện ích trình duyệt

Hãy cài **Tampermonkey** (trình quản lý userscript) trước. Đừng dùng *Load unpacked* / trang tiện ích của Chrome — file `.user.js` do Tampermonkey quản lý, không phải extension.

## Cách A — cài một cú nhấp (khuyến nghị)

[![Install](https://img.shields.io/badge/install-vi-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Sau khi cài Tampermonkey, nhấp badge hoặc mở URL bên dưới: Tampermonkey mở trang cài đặt, nhấn **Cài đặt**.

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Cách B — cài từ file ZIP đã tải

1. **Tải file ZIP**

   Trên [trang GitHub](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) nhấn **Code → Download ZIP**.
2. **Giải nén**

   Giải nén ZIP ra một thư mục bình thường.
3. **Cài Tampermonkey**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → Thêm vào Chrome; sau đó mở `chrome://extensions` và bật **Chế độ nhà phát triển**. Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → Thêm vào Firefox.
4. **Nạp userscript**

   Mở Tampermonkey trên thanh công cụ → **Dashboard**. Kéo `tanktrouble-netlab.install.user.js` từ thư mục vào trang Dashboard, rồi nhấn **Cài đặt**.
5. **Tải lại trang game**

   Mở <https://tanktrouble.com/game> (tải lại nếu đang mở). Bóng nổi xuất hiện ở góc trên bên trái; nhấp vào để mở rộng và dùng ngay.

Nếu kéo thả không được: dùng URL cài một cú nhấp ở trên, hoặc vào Tampermonkey Dashboard → Utilities để nhập file. `tanktrouble-netlab.user.js` là cùng nội dung; `install.user.js` chỉ là bản có BOM để kéo thả.

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
