# Hướng dẫn cài đặt

> 🇻🇳 **TankTrouble — tối ưu hóa mạng** — Hiển thị mạng phong phú hơn, thời gian thực hơn và chính xác hơn — kèm tối ưu hóa thật sự.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · <b>🇻🇳 Tiếng Việt</b></sub></p>

## ⚠️ Đây là userscript — không phải tiện ích trình duyệt

Hãy cài **Tampermonkey** (trình quản lý userscript) trước. **Không** dùng `chrome://extensions` / “Load unpacked”: file `.user.js` do Tampermonkey quản lý, không phải extension. Nếu thấy một trang đầy mã code, bạn đã vào sai chỗ — hãy quay lại hướng dẫn này.

## Cách A — kéo file đã tải vào Dashboard của Tampermonkey (khuyến nghị, đơn giản nhất)

### Bước 1 (chỉ làm một lần) — cài Tampermonkey

Chrome/Edge: mở [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → **Thêm vào Chrome**. Firefox: mở [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → **Thêm vào Firefox**.

Sau khi cài, nếu không thấy biểu tượng Tampermonkey trên thanh công cụ: nhấp nút **mảnh ghép / tiện ích** ở góc trên bên phải trình duyệt rồi **ghim (Pin)** Tampermonkey.

### Bước 2 — tải file script về

Nhấp **[⬇ Download](https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js)** (hoặc mở liên kết bên dưới): trình duyệt sẽ lưu file vào thư mục **“Downloads”** với tên `tanktrouble-netlab.install.user.js`.

**Không đổi tên, không giải nén, không chỉnh sửa** — đây chỉ là một script dạng văn bản.

```
https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js
```

### Bước 3 — mở **Dashboard** của Tampermonkey (đa số người mắc ở đây)

Nhấp **biểu tượng Tampermonkey** trên thanh công cụ trình duyệt → trong menu hiện ra, nhấp **Dashboard** (giao diện tiếng Việt: **Bảng điều khiển**).

- Không thấy biểu tượng: nhấp nút **mảnh ghép / tiện ích** rồi nhấp Tampermonkey.
- ⚠️ Mục “**Thêm script mới**” trong menu đó mở **trình soạn thảo**, không phải chỗ cài đặt. Hãy dùng **Dashboard** (giao diện tiếng Trung gọi là “管理面板”).
- Nếu bạn đang ở một trang Tampermonkey khác, nhấp **Installed scripts / Script đã cài** ở thanh bên trái để quay lại danh sách.

### Bước 4 — kéo file vào

Giữ **trang danh sách Dashboard** đang mở, rồi kéo `tanktrouble-netlab.install.user.js` từ thư mục **“Downloads” thả vào trang Dashboard** → trang cài đặt của Tampermonkey hiện ra (trang nền tối ghi tên script "TankTrouble Network Optimization", phiên bản và nút **Install**) → nhấp **Install**.

- Nếu kéo thả không được: **Dashboard → Utilities / Tiện ích → Install from URL**, dán đúng liên kết tải về rồi nhấp **Install**.
- Bạn cũng có thể nhấp thẳng liên kết cài một cú nhấp (giữ ở dưới là **Cách B**): nếu đã cài Tampermonkey, trang cài đặt sẽ mở ngay. Nếu thay vào đó thấy một trang đầy code bắt đầu bằng `// ==UserScript==`, nghĩa là cú nhấp chưa đến Tampermonkey → quay lại cách kéo thả ở trên.

### Bước 5 — vào game

Mở <https://tanktrouble.com/game> → nhấn **Ctrl + F5** để tải lại cứng → bảng điều khiển hoặc quả bóng nổi hiện ở góc trên bên trái. Nếu không thấy, nhấn **Ctrl + Shift + L** — có thể nó đang bị ẩn.

### Tự kiểm tra (ba mục)

① Danh sách **Dashboard** có "TankTrouble Network Optimization" và công tắc đang **ON**; ② trên trang `tanktrouble.com` biểu tượng Tampermonkey hiện huy hiệu số (**1**); ③ nhấn **F12 → Console**, phải thấy dòng `[TT NetLab vX.Y.Z] loaded...`.

## Cách B — cài một cú nhấp (khi đã cài Tampermonkey)

[![Install](https://img.shields.io/badge/install-vi-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Khi đã cài Tampermonkey, nhấp badge (hoặc liên kết bên dưới): Tampermonkey mở ngay trang cài đặt của chính nó — trang nền tối hiển thị tên script "TankTrouble Network Optimization", phiên bản và nút **Install**; phải nhấn **Install** thì mới cài xong. Nếu thấy một trang đầy code bắt đầu bằng `// ==UserScript==`, cú nhấp chưa đến Tampermonkey → quay lại **Cách A** (kéo thả).

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Cách C — cài từ file ZIP đã tải (ngoại tuyến)

Nếu bạn đã biết cách cài bằng kéo thả thì **Cách A là đủ — không cần tải ZIP**. Chỉ dùng ZIP khi bạn muốn giữ toàn bộ kho mã ngoại tuyến.

1. **Tải file ZIP**

   Trên [trang GitHub](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) nhấn **Code → Download ZIP**.
2. **Giải nén**

   Giải nén ZIP ra một thư mục bình thường.
3. **Kiểm tra đã cài Tampermonkey**

   Nếu chưa, quay lại bước 1 của Cách A. Không dùng `chrome://extensions`.
4. **Nạp userscript**

   Nhấp biểu tượng Tampermonkey → **Dashboard**, giữ trang danh sách đang mở, kéo `tanktrouble-netlab.install.user.js` từ thư mục vào trang Dashboard rồi nhấp **Install**. Nếu kéo thả không được, dùng **Dashboard → Utilities → Install from URL**.
5. **Tải lại trang game**

   Mở <https://tanktrouble.com/game> (tải lại nếu đang mở). Bóng nổi xuất hiện ở góc trên bên trái; nhấp vào để mở rộng và dùng ngay.

`tanktrouble-netlab.user.js` là cùng nội dung; `install.user.js` chỉ là bản có BOM để kéo thả.

## Phím tắt

| Phím | |
|---|---|
| `Ctrl+Shift+S` | bật/tắt tối ưu hóa mạng (so sánh A/B trực tiếp) |
| `Ctrl+Shift+L` | ẩn / hiện HUD |
| `Ctrl+Shift+E` | xuất báo cáo chẩn đoán (đồng thời sao chép vào clipboard) |
| `Ctrl+Shift+P` | dò 7 khu vực máy chủ và xếp hạng |

Nút **⚡** trong bảng tương đương `Ctrl+Shift+S`. Bảng cho chọn một trong **11 ngôn ngữ**; ngôn ngữ, công tắc tối ưu và vị trí bóng được lưu trong `localStorage`.

## Câu hỏi thường gặp cho người mới (nếu rối, đọc mục này trước)

- **Đây có phải tiện ích Chrome không? Có cần thêm vào chrome://extensions không?** — Không. Đây là userscript: hãy cài Tampermonkey trước, rồi cài script bên trong Tampermonkey — đừng dùng 'Load unpacked'.
- **Tampermonkey trông có vẻ lạ, có an toàn không?** — Tampermonkey là trình quản lý userscript phổ biến nhất cho Chrome/Edge/Firefox, chỉ tải từ store chính thức (tampermonkey.net). Dự án này mã nguồn mở trên GitHub, không cần server, VPN hay cấu hình mạng.
- **Mình tải ZIP về, có kéo cả thư mục đã giải nén vào không?** — Không. Với Cách A bạn không cần ZIP chút nào: chỉ tải một file `tanktrouble-netlab.install.user.js` (bước 2) rồi kéo đúng file đó từ thư mục “Downloads” vào Dashboard Tampermonkey. Cả thư mục không phải script nên không cài được.
- **Dashboard của Tampermonkey ở đâu và mở thế nào?** — Nhấp **biểu tượng Tampermonkey** trên thanh công cụ → **Dashboard** (Bảng điều khiển). Không thấy biểu tượng? Nhấp nút mảnh ghép/tiện ích rồi ghim Tampermonkey. Nếu đang ở trang Tampermonkey khác, nhấp **Installed scripts / Script đã cài** ở thanh bên trái để về danh sách. ⚠️ Đừng dùng mục “**Thêm script mới**” — nó mở trình soạn thảo, không phải chỗ cài đặt.
- **Tôi nhấp “Thêm script mới” thì thấy trình soạn thảo — đó có phải chỗ cài đặt không?** — Không. “Thêm script mới” chỉ mở **trình soạn thảo** của Tampermonkey để viết script, không phải nơi cài script này. Chỗ cài đặt là trang danh sách của **Dashboard** (“Script đã cài”): kéo file `tanktrouble-netlab.install.user.js` đã tải vào trang đó, hoặc dùng **Dashboard → Utilities / Tiện ích → Install from URL** và dán `https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js`.
- **Mở link tải về chỉ thấy một trang code / Chrome báo không cài được từ trang này.** — Với Cách A thì bình thường — link đó chỉ để lưu file (bạn kiểm tra thư mục “Downloads” xem có `tanktrouble-netlab.install.user.js` không). Sau đó kéo file đó vào trang danh sách **Dashboard** của Tampermonkey. Nếu file không được lưu, nhấp chuột phải vào link → “Lưu liên kết thành…”, hoặc dùng **Dashboard → Utilities → Install from URL** với đúng link đó.
- **Kéo file vào mà không có gì xảy ra?** — Phải thả vào trang danh sách **Dashboard** của Tampermonkey (không phải chrome://extensions hay trang web thường), và giữ trang đó mở, ở trên cùng. Nếu bị chặn kéo thả, dùng **Dashboard → Utilities → Install from URL**.
- **Cài rồi mà vào game không thấy gì?** — Nhấn Ctrl+F5 để tải lại trang game; kiểm tra script đang bật trong Dashboard Tampermonkey; nhấn Ctrl+Shift+L để hiện HUD. Trang mở trước khi cài phải được tải lại.
- **Sau khi cài có cần giữ ZIP/thư mục không?** — Không. Script đã nằm trong Tampermonkey; có thể xóa ZIP và thư mục. Sau này cập nhật trong Tampermonkey hoặc mở lại link raw để cài lại.
- **Trong Tampermonkey có mục 'Import from file' / 'Add file' — có phải tải file lên đó không?** — Không. Mục đó dành cho file backup `.zip` của Tampermonkey. Muốn cài script này hãy dùng Dashboard → Utilities → Install from URL, hoặc kéo đúng file `.user.js` vào Dashboard.
- **Có cần đổi tên, sửa hoặc giải nén file `.user.js` không?** — Không, dùng nguyên file là được. File đó chính là nội dung script; đừng đưa vào `chrome://extensions` và đừng tải cả thư mục.
- **Tôi đã nhấp link cài một cú nhấp (Cách B) — không biết đã cài được chưa?** — Nếu thành công, **Tampermonkey sẽ mở trang cài đặt của chính nó**: trang nền tối hiển thị tên script "TankTrouble Network Optimization", số phiên bản và nút **Install** — phải nhấn **Install** thì mới cài xong. Nếu bạn thấy một trang đầy code (bắt đầu bằng `// ==UserScript==`) hoặc file chỉ được tải về, thì cú nhấp chưa đến Tampermonkey: quay lại **Cách A**, kéo file `tanktrouble-netlab.install.user.js` đã tải vào trang **Dashboard**, hoặc dùng **Dashboard → Utilities → Install from URL**.
- **Làm sao xác nhận nó thật sự được cài và đang chạy?** — Ba bước kiểm tra: ① trong danh sách script của **Dashboard** Tampermonkey có “TankTrouble Network Optimization” và công tắc đang **ON**; ② trên trang `tanktrouble.com`, biểu tượng Tampermonkey hiện huy hiệu số (**1**); ③ nhấn **F12 → Console**, phải thấy dòng `[TT NetLab vX.Y.Z] loaded...`. Nếu thiếu ③: trước tiên nhấn **Ctrl+F5** để tải lại trang; nếu vẫn không có thì script đã bị tắt hoặc chỉ cài được một phần (**cài lại**; file phải bắt đầu từ dòng 1 với `// ==UserScript==`, sao chép từ giữa như `(function () {` là không có tác dụng).

## Khắc phục sự cố

- **Không thấy gì xuất hiện** — Kiểm tra URL khớp `*://*.tanktrouble.com/*` và script đang bật, sau đó nhấn `Ctrl+F5`.
- **Bảng điều khiển biến mất** — Nhấn `Ctrl+Shift+L`. Vị trí và trạng thái thu gọn được ghi nhớ.
- **Vẫn bị giật** — Đó là do tuyến mạng của bạn, không phải script. Xuất báo cáo (`Ctrl+Shift+E`) và so sánh các khu vực trong bảng.

## Liên kết

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Tiếng Việt](../README.vi.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
