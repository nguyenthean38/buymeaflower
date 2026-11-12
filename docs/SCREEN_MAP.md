# Bản đồ màn hình

## Trang công khai

| Đường dẫn | Màn hình | Nội dung chính |
|---|---|---|
| `/` | Trang giới thiệu | Hero có thẻ nhà sáng tạo trôi nổi, ô chọn tên trang, ô tặng hoa chạy thật, hội viên, cửa hàng, tính năng, hỏi đáp |
| `/kham-pha` | Khám phá | Tìm nhà sáng tạo theo tên (không cần gõ dấu), lọc theo lĩnh vực |
| `/dang-ky` | Đăng ký | 3 bước: chọn tên trang (kiểm tra trùng) → email, mật khẩu có thanh độ mạnh → mã xác minh 6 số |
| `/hoan-thien` | Hoàn thiện trang | Hồ sơ → liên kết ngân hàng (bỏ qua được) → màn chúc mừng có liên kết trang |
| `/dang-nhap` | Đăng nhập | Vào bằng tài khoản demo một chạm, hoặc email → mật khẩu |
| `/quen-mat-khau`, `/dat-lai-mat-khau` | Khôi phục mật khẩu | |
| `/:username` | Trang cá nhân | Ảnh bìa, hồ sơ, theo dõi, ô tặng hoa, mục tiêu, người ủng hộ gần đây; tab Hội viên, Bài viết, Bộ ảnh, Cửa hàng; chủ trang có nút Sửa trang và Tạo |
| `/:username/bai-viet/:id` | Bài viết | Nội dung, ảnh, trình phát âm thanh, thích, bình luận; bài riêng bị khoá cho tới khi ủng hộ hoặc tham gia hội viên |
| `*` | Không tìm thấy | Nếu tên trang còn trống thì mời lấy tên đó |

## Khu quản lý (`/quan-ly`, cần đăng nhập)

| Đường dẫn | Màn hình | Nội dung chính |
|---|---|---|
| `/quan-ly` | Trang chủ | Thu nhập theo kỳ, cơ cấu tặng hoa / hội viên / cửa hàng, biểu đồ ngày, số dư, giao dịch gần đây, chia sẻ trang, mã QR |
| `/quan-ly/ung-ho` | Ủng hộ | Danh sách lượt tặng hoa, trả lời lời nhắn, hoàn tiền, xuất CSV; cài giá mỗi bông, lời cảm ơn, trích quỹ thiện nguyện |
| `/quan-ly/hoi-vien` | Hội viên | Chỉ số, biểu đồ, danh sách hội viên; trình soạn hạng có xem trước; tạm dừng thu phí, tặng tư cách hội viên |
| `/quan-ly/cua-hang` | Cửa hàng | Đơn hàng, hoàn tiền; mẫu tạo nhanh, trình soạn sản phẩm có xem trước |
| `/quan-ly/mong-uoc` | Điều ước | Món đồ cần cho công việc, thanh tiến độ góp tiền |
| `/quan-ly/gioi-thieu` | Giới thiệu bạn | Liên kết mời, hoa hồng, lịch sử chi trả |
| `/quan-ly/bai-viet` | Bài viết | Đã đăng / bản nháp / hẹn giờ, ghim, tìm kiếm |
| `/quan-ly/bai-viet/moi`, `/quan-ly/bai-viet/:id` | Trình soạn bài | Bài chữ (định dạng đậm, nghiêng, tiêu đề, danh sách, trích dẫn, liên kết), album ảnh, bài âm thanh; đối tượng xem, chuyên mục, hẹn giờ |
| `/quan-ly/bo-anh` | Bộ ảnh | Thêm, sửa, xoá ảnh; đối tượng xem; cho tải bản gốc |
| `/quan-ly/tin-nhan` | Tin nhắn | Hộp thư 1-1 và gửi cho nhóm (người theo dõi, người ủng hộ, hội viên) |
| `/quan-ly/nut-va-hinh` | Nút & hình ảnh | Trình tạo nút, tiện ích nổi, thông báo khi phát trực tiếp, mã QR, thiệp cảm ơn |
| `/quan-ly/tich-hop` | Tích hợp | Kết nối dịch vụ ngoài, webhook |
| `/quan-ly/rut-tien` | Rút tiền | Số dư, luồng liên kết ngân hàng 5 bước, rút tiền, lịch sử |
| `/quan-ly/cai-dat` | Cài đặt | Mục tiêu, phí giao dịch, đổi tên trang, giao diện sáng/tối, thông báo |
| `/quan-ly/tai-khoan` | Tài khoản | Hồ sơ, đổi mật khẩu, người theo dõi, đang theo dõi |

Mở `/quan-ly?demo=1` để vào thẳng tài khoản demo.
