/* Dữ liệu tham chiếu dùng chung. Tên ngân hàng, ví điện tử đều là TÊN HƯ CẤU của bản demo. */

/** Phí nền tảng: 5% trên mỗi giao dịch (mô phỏng) */
export const PLATFORM_FEE = 0.05
export const DOMAIN = 'buymeaflower.vn'

/** Món thay cho "bông hoa" trên trang cá nhân */
export const ITEM_OPTIONS = [
  { emoji: '🌸', name: 'bông hoa' },
  { emoji: '🌻', name: 'đoá hướng dương' },
  { emoji: '🌹', name: 'bông hồng' },
  { emoji: '🪷', name: 'đoá sen' },
  { emoji: '🍵', name: 'ấm trà' },
  { emoji: '🧋', name: 'ly trà sữa' },
  { emoji: '🍜', name: 'tô phở' },
  { emoji: '📚', name: 'cuốn sách' },
]
export const EMOJI_CHOICES = ['🌸', '🌻', '🌹', '🪷', '🌷', '💐', '🌼', '🍀', '🍵', '🧋', '☕', '🍜', '🥖', '🍰', '📚', '🎨', '🎸', '🎬', '💌', '⭐']

/** Màu chủ đề cho trang cá nhân */
export const THEME_COLORS = [
  { name: 'Cánh sen', value: '#e83e7c' },
  { name: 'Hoàng mai', value: '#e0a019' },
  { name: 'Lá non', value: '#2f9e6e' },
  { name: 'Lưu ly', value: '#4a78e0' },
  { name: 'Tím Huế', value: '#8a5cd6' },
  { name: 'Phượng đỏ', value: '#e0523a' },
  { name: 'Mực tàu', value: '#2b1622' },
]

export const CATEGORIES = ['Minh hoạ', 'Âm nhạc', 'Viết lách', 'Podcast', 'Video', 'Nhiếp ảnh', 'Lập trình', 'Thủ công', 'Ẩm thực', 'Giáo dục']

/** Ngân hàng hư cấu cho luồng liên kết tài khoản nhận tiền */
export const BANKS = [
  { id: 'songhong', name: 'Ngân hàng Sông Hồng', short: 'SHB Việt', color: '#d6402b' },
  { id: 'cuulong', name: 'Ngân hàng Cửu Long', short: 'CLBank', color: '#1f7fd1' },
  { id: 'truongson', name: 'Ngân hàng Trường Sơn', short: 'TSBank', color: '#1f9a67' },
  { id: 'badinh', name: 'Ngân hàng Ba Đình', short: 'BĐBank', color: '#8a5cd6' },
  { id: 'hoasen', name: 'Ngân hàng Hoa Sen', short: 'SenBank', color: '#e83e7c' },
  { id: 'bachdang', name: 'Ngân hàng Bạch Đằng', short: 'BĐGBank', color: '#0f6f8f' },
  { id: 'lacviet', name: 'Ngân hàng Lạc Việt', short: 'LVBank', color: '#e0a019' },
  { id: 'thanglong', name: 'Ngân hàng Thăng Long', short: 'TLBank', color: '#c2410c' },
  { id: 'anlac', name: 'Ngân hàng An Lạc', short: 'ALBank', color: '#4a78e0' },
]

/** Cách thanh toán (mô phỏng) */
export const PAY_METHODS = [
  { id: 'qr', label: 'Quét mã QR', desc: 'Chuyển khoản nhanh qua ứng dụng ngân hàng' },
  { id: 'wallet', label: 'Ví điện tử', desc: 'Ví Bông, Ví Lá (ví minh hoạ)' },
  { id: 'card', label: 'Thẻ nội địa / quốc tế', desc: 'Nhập số thẻ để thanh toán' },
]

/** Quyền lợi gợi ý khi tạo hạng hội viên */
export const REWARD_TEMPLATES = [
  { id: 'monthly', icon: 'Heart', title: 'Ủng hộ mình hằng tháng', desc: 'Cho người hâm mộ biết khoản đóng góp định kỳ giúp bạn làm việc đều đặn.' },
  { id: 'exclusive', icon: 'Lock', title: 'Mở khoá bài viết và tin nhắn riêng', desc: 'Nội dung chỉ dành cho hội viên.' },
  { id: 'shoutout', icon: 'Sparkles', title: 'Nêu tên cảm ơn hội viên mới', desc: 'Cảm ơn công khai trong bài viết hoặc video kế tiếp.' },
  { id: 'library', icon: 'BookOpen', title: 'Xem toàn bộ thư viện', desc: 'Truy cập mọi bài viết, bộ ảnh đã đăng từ trước.' },
  { id: 'discount', icon: 'Ticket', title: 'Giảm giá sản phẩm trong cửa hàng', desc: 'Ưu đãi riêng cho hội viên khi mua sản phẩm.' },
  { id: 'wip', icon: 'Brush', title: 'Xem bản nháp đang làm dở', desc: 'Bản phác, bản thu thử trước khi công bố.' },
  { id: 'behind', icon: 'Camera', title: 'Hậu trường', desc: 'Quá trình làm việc, dụng cụ, những lần hỏng.' },
  { id: 'early', icon: 'Star', title: 'Xem sớm', desc: 'Hội viên được xem tác phẩm trước mọi người.' },
  { id: 'merch', icon: 'Gift', title: 'Quà tặng gửi về nhà', desc: 'Thiệp, sticker, bản in — nên dành cho hạng cao.' },
]

/** Mẫu sản phẩm trong cửa hàng */
export const SHOP_TEMPLATES = [
  { kind: 'scratch', label: 'Tạo từ đầu', icon: 'Sparkles', tone: 'bg-subtle' },
  { kind: 'booking', label: 'Hẹn trò chuyện 1:1', icon: 'Video', tone: 'bg-info-soft', preset: { name: 'Trò chuyện 1:1 trong 30 phút', price: 250000, desc: 'Một buổi gọi video riêng để hỏi đáp, góp ý tác phẩm hoặc định hướng nghề.' } },
  { kind: 'digital', label: 'Tệp tải về', icon: 'Download', tone: 'bg-pos-soft', preset: { name: 'Bộ hình nền điện thoại', price: 49000, desc: 'Tệp nén gồm các hình nền độ phân giải cao, tải về ngay sau khi thanh toán.' } },
  { kind: 'ticket', label: 'Vé sự kiện trực tuyến', icon: 'Ticket', tone: 'bg-brand-50', preset: { name: 'Vé buổi phát trực tiếp tháng này', price: 99000, desc: 'Một buổi phát trực tiếp kín dành cho người mua vé, có phần hỏi đáp.' } },
  { kind: 'commission', label: 'Nhận vẽ theo yêu cầu', icon: 'Brush', tone: 'bg-gold-soft', preset: { name: 'Vẽ chân dung theo yêu cầu', price: 450000, desc: 'Một bức chân dung phong cách riêng, giao tệp trong 7 ngày.' } },
  { kind: 'friends', label: 'Nhóm bạn thân', icon: 'Users', tone: 'bg-ice-soft', preset: { name: 'Vào nhóm bạn thân', price: 30000, desc: 'Được thêm vào danh sách bạn thân để xem những chia sẻ đời thường.' } },
]

export const SHOP_KIND_LABEL = { scratch: 'Sản phẩm', booking: 'Lịch hẹn', digital: 'Tệp tải về', ticket: 'Vé sự kiện', commission: 'Đặt vẽ', friends: 'Nhóm riêng' }

export const VISIBILITY = [
  { value: 'public', label: 'Công khai', desc: 'Ai cũng xem được' },
  { value: 'supporters', label: 'Người ủng hộ', desc: 'Người đã tặng hoa hoặc là hội viên' },
  { value: 'members', label: 'Chỉ hội viên', desc: 'Chỉ hội viên đang hoạt động' },
]
export const VISIBILITY_LABEL = Object.fromEntries(VISIBILITY.map((v) => [v.value, v.label]))

export const AVATAR_COLORS = ['#e83e7c', '#2f9e6e', '#4a78e0', '#8a5cd6', '#e0a019', '#e0523a', '#0f8f9a', '#c2410c']
