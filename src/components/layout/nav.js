import { Home, Heart, Crown, Store, Gift, Megaphone, Newspaper, Image, MessageSquare, MousePointerClick, Plug, Landmark, Settings } from 'lucide-react'

/** Điều hướng của khu quản lý. `to` là đường dẫn tuyệt đối. */
export const DASH_NAV = [
  { items: [{ to: '/quan-ly', label: 'Trang chủ', icon: Home, end: true }] },
  { heading: 'Kiếm tiền', items: [
    { to: '/quan-ly/ung-ho', label: 'Ủng hộ', icon: Heart },
    { to: '/quan-ly/hoi-vien', label: 'Hội viên', icon: Crown },
    { to: '/quan-ly/cua-hang', label: 'Cửa hàng', icon: Store },
    { to: '/quan-ly/mong-uoc', label: 'Điều ước', icon: Gift },
    { to: '/quan-ly/gioi-thieu', label: 'Giới thiệu bạn', icon: Megaphone },
  ] },
  { heading: 'Đăng tải', items: [
    { to: '/quan-ly/bai-viet', label: 'Bài viết', icon: Newspaper },
    { to: '/quan-ly/bo-anh', label: 'Bộ ảnh', icon: Image },
    { to: '/quan-ly/tin-nhan', label: 'Tin nhắn', icon: MessageSquare, badge: 'messages' },
  ] },
  { heading: 'Thiết lập', items: [
    { to: '/quan-ly/nut-va-hinh', label: 'Nút & hình ảnh', icon: MousePointerClick },
    { to: '/quan-ly/tich-hop', label: 'Tích hợp', icon: Plug },
    { to: '/quan-ly/rut-tien', label: 'Rút tiền', icon: Landmark },
    { to: '/quan-ly/cai-dat', label: 'Cài đặt', icon: Settings },
  ] },
]
