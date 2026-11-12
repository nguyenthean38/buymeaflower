# Hệ thống thiết kế Buy Me a Flower

Tài liệu ngắn về màu sắc, chữ, thành phần dùng chung và quy ước dữ liệu của bản demo.

## Nhận diện

- **Tên:** Buy Me a Flower. Người hâm mộ "tặng một bông hoa" để cảm ơn nhà sáng tạo.
- **Biểu tượng:** bông hoa đào năm cánh màu hồng cánh sen, nhuỵ vàng (`src/components/brand/Flower.jsx`, `Logo.jsx`).
- **Tài khoản demo:** hoạ sĩ minh hoạ **Mai Chi** (`@maichi`) cùng 8 nhà sáng tạo khác. Tất cả là nhân vật hư cấu.

## Màu (biến CSS trong `src/styles/index.css`)

| Nhóm | Biến | Ghi chú |
|---|---|---|
| Nền | `--c-canvas`, `--c-side`, `--c-surface`, `--c-subtle` | Nền giấy kem ấm, thẻ trắng |
| Chữ | `--c-fg`, `--c-dim`, `--c-muted`, `--c-faint` | Nâu mận, 4 cấp đậm nhạt |
| Thương hiệu | `--c-brand-50…700` | Hồng cánh sen `#e83e7c` |
| Điểm nhấn | `--c-ice` (xanh lá), `--c-gold` (vàng nhuỵ) | Kèm bản `-soft` làm nền |
| Trạng thái | `--c-pos`, `--c-neg`, `--c-warn`, `--c-info` | Kèm bản `-soft` |
| Biểu đồ | `--c-chart-1…6` | Hồng, xanh lá, vàng, tím, cam, xám |
| Trang cá nhân | `--page` | Màu chủ đề riêng của từng nhà sáng tạo, đặt bằng `style` trên khung trang |

Chế độ tối định nghĩa lại cùng bộ biến dưới lớp `.dark`. Tailwind v4 đọc các biến qua `@theme inline`, nên viết `bg-surface`, `text-muted`, `border-line`, `bg-brand-500`, `bg-page`… là tự đổi theo giao diện.

## Chữ

- **Be Vietnam Pro** cho toàn bộ giao diện; **JetBrains Mono** cho khối mã nhúng.
- Tiện ích: `ds-display` (tiêu đề trang giới thiệu), `ds-h1`, `ds-h2`, `ds-h3`, `ds-label`, `ds-caption`, `num` (số thẳng cột), `prose-post` (nội dung bài viết).

## Thành phần dùng chung

| Thư mục | Thành phần |
|---|---|
| `components/ui` | Button, IconButton, Input, MoneyInput, Select, Textarea, Checkbox, Toggle, RadioCards, OtpInput, Badge, Avatar, Tabs, Segmented, Progress, KeyValue, EmptyState, Callout, Tooltip, Modal, Confirm, Drawer, Popover, Menu, FlowShell, Table, Toaster, QrCode |
| `components/charts.jsx` | AreaChart, MiniBars, SplitBar (SVG tự vẽ) |
| `components/brand` | Logo, Flower, FlowerArt (khung ảnh: hiện ảnh trong `public/images`, không có thì vẽ tranh hoa), PetalRain (cánh hoa rơi khi thanh toán xong) |
| `components/layout` | DashLayout, DashPage, Section, StatTile, UserMenu |
| `features/support` | SupportBox (ô tặng hoa), PaymentModal (cổng thanh toán mô phỏng), ThankYouModal |

Nút bấm bo tròn dạng viên thuốc, thẻ bo góc lớn (`rounded-2xl`, `rounded-3xl`), nhiều khoảng trắng.

## Dữ liệu và trạng thái

- `src/data/seed.js` sinh dữ liệu của tài khoản demo bằng bộ sinh số có hạt giống, mỗi lần tải ra cùng số liệu.
- `src/data/creators.js` chứa các nhà sáng tạo khác; `src/data/photos.js` ánh xạ ảnh.
- `src/store/index.js` (Zustand, lưu `localStorage`): `useApp` giữ toàn bộ dữ liệu của người đang đăng nhập, sửa bằng `mutate((d) => { … })`; phần `visitor` ghi lại những gì bạn làm trên trang của người khác (hoa đã tặng, hạng đã tham gia, bài đã thích).
- Phí nền tảng 5% (`PLATFORM_FEE`), số dư = tổng thực nhận − tổng đã rút.

## Quy ước

- Ngày mốc của bản demo: **12/11/2026** (`TODAY` trong `lib/format.js`).
- Tiền: `formatVND` → `120.000 ₫`.
- Đường dẫn bằng tiếng Việt không dấu: `/quan-ly/hoi-vien`, `/kham-pha`…
- Tên ngân hàng, ví điện tử, cổng thanh toán đều là tên hư cấu.
