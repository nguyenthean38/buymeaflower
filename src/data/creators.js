/* Các nhà sáng tạo khác trên nền tảng (đều là nhân vật hư cấu). Dùng cho trang giới thiệu, khám phá và trang cá nhân công khai. */
import { seeded } from '@/lib/random'
import { TODAY, addDays } from '@/lib/format'
import { AVATAR_COLORS } from './reference'
import { personName } from './seed'

const RAW = [
  { username: 'banhmique', name: 'Bánh Mì Quê', tagline: 'đang quay video nấu món quê miền Trung', category: 'Ẩm thực', color: '#e0523a', avatarColor: '#e0523a', item: { emoji: '🥖', name: 'ổ bánh mì' }, price: 15000, supporters: 9138, cover: 1000,
    about: 'Bếp nhỏ ở Quảng Ngãi của hai chị em. Mỗi tuần một món quê: cá bống kho tiêu, ram bắp, don…\n\nTiền ủng hộ dùng để mua nguyên liệu và nâng cấp cái bếp củi.' },
  { username: 'ducanhguitar', name: 'Đức Anh Guitar', tagline: 'đang soạn tab guitar cho nhạc Việt xưa', category: 'Âm nhạc', color: '#4a78e0', avatarColor: '#4a78e0', item: { emoji: '🎸', name: 'dây đàn' }, price: 20000, supporters: 2095, cover: 1020,
    about: 'Mình soạn tab fingerstyle cho các bài nhạc Việt xưa và chia sẻ miễn phí. Hội viên nhận bản PDF sạch và video hướng dẫn từng đoạn.' },
  { username: 'docchamlai', name: 'Đọc Chậm Lại', tagline: 'đang làm podcast về sách và thói quen đọc', category: 'Podcast', color: '#8a5cd6', avatarColor: '#8a5cd6', item: { emoji: '📚', name: 'cuốn sách' }, price: 25000, supporters: 703, cover: 1040,
    about: 'Podcast hai tuần một số, mỗi số một cuốn sách và một câu hỏi để mang theo. Không quảng cáo, sống nhờ người nghe.' },
  { username: 'codedao', name: 'Code Dạo Ký Sự', tagline: 'đang viết blog lập trình cho người mới', category: 'Lập trình', color: '#2f9e6e', avatarColor: '#2f9e6e', item: { emoji: '🧋', name: 'ly trà sữa' }, price: 30000, supporters: 1460, cover: 1060,
    about: 'Mình viết về lập trình web bằng tiếng Việt dễ hiểu: từ dòng HTML đầu tiên tới lúc đưa sản phẩm lên mạng.' },
  { username: 'tiemgomnho', name: 'Tiệm Gốm Nhỏ', tagline: 'đang nặn gốm thủ công ở Bát Tràng', category: 'Thủ công', color: '#c2410c', avatarColor: '#c2410c', item: { emoji: '🍵', name: 'chén trà' }, price: 20000, supporters: 512, cover: 1080,
    about: 'Xưởng gốm hai người. Bọn mình quay lại từng mẻ nung, kể cả những mẻ nứt vỡ.' },
  { username: 'thayhungtoan', name: 'Thầy Hưng dạy Toán', tagline: 'đang làm video ôn Toán miễn phí cho lớp 9', category: 'Giáo dục', color: '#0f8f9a', avatarColor: '#0f8f9a', item: { emoji: '✏️', name: 'cây bút chì' }, price: 10000, supporters: 4321, cover: 1100,
    about: 'Giáo viên Toán ở Nghệ An. Mỗi tối một video chữa đề, học sinh nào cũng xem được, không thu phí.' },
  { username: 'saigonfilm', name: 'Sài Gòn Trên Phim', tagline: 'đang chụp ảnh phim về những con hẻm', category: 'Nhiếp ảnh', color: '#2b1622', avatarColor: '#7d6570', item: { emoji: '🎞️', name: 'cuộn phim' }, price: 35000, supporters: 146, cover: 1120,
    about: 'Một cuộn phim 36 kiểu mỗi tuần, lang thang hẻm nhỏ Sài Gòn. Người ủng hộ nhận bản scan gốc.' },
  { username: 'lenvaque', name: 'Len và Que', tagline: 'đang hướng dẫn đan móc cho người vụng tay', category: 'Thủ công', color: '#e0a019', avatarColor: '#e0a019', item: { emoji: '🧶', name: 'cuộn len' }, price: 18000, supporters: 877, cover: 1140,
    about: 'Chart móc miễn phí hằng tuần, video quay chậm từng mũi. Hội viên có lớp trực tuyến mỗi tháng.' },
]

const MSG = ['Cảm ơn bạn vì những nội dung tử tế!', 'Tuần nào mình cũng chờ bài mới.', 'Ủng hộ nhỏ, mong bạn làm lâu dài.', '', 'Con mình học theo video của thầy tiến bộ hẳn.', 'Chúc kênh ngày càng phát triển!', 'Món tuần trước mình nấu theo, cả nhà khen.', '']

function expand(c, idx) {
  const r = seeded(1000 + idx * 37)
  const supports = Array.from({ length: 6 }, (_, i) => {
    const qty = r.pick([1, 1, 3, 5, 2])
    const d = new Date(addDays(TODAY, -i * r.int(1, 3))); d.setHours(r.int(8, 22), r.int(0, 59))
    return { id: `${c.username}-s${i}`, name: personName(r), avatarColor: r.pick(AVATAR_COLORS), type: 'flower', qty, amount: qty * c.price, message: r.pick(MSG), private: false, at: d.toISOString() }
  })
  const levels = [
    { id: `${c.username}-l1`, name: 'Bạn đồng hành', price: Math.round(c.price * 1.5 / 1000) * 1000, yearly: c.price * 15, desc: 'Một khoản nhỏ hằng tháng để mình yên tâm làm tiếp.', rewards: ['Ủng hộ mình hằng tháng', 'Mở khoá bài viết và tin nhắn riêng'], published: true, art: c.cover + 1 },
    { id: `${c.username}-l2`, name: 'Bạn thân', price: c.price * 4, yearly: c.price * 40, desc: 'Xem sớm mọi thứ và trò chuyện riêng mỗi tháng.', rewards: ['Mọi quyền lợi của hạng trước', 'Xem sớm', 'Hậu trường', 'Nêu tên cảm ơn hội viên mới'], published: true, art: c.cover + 2 },
  ]
  const posts = [
    { id: `${c.username}-p1`, type: 'text', title: 'Thư tháng 11: những gì mình đang làm', html: `<p>Chào các bạn,</p><p>Tháng này ${c.name} ${c.tagline.replace(/^đang /, 'vẫn đang ')}. Cảm ơn ${new Intl.NumberFormat('vi-VN').format(c.supporters)} người đã ủng hộ từ trước tới giờ.</p><p>Có điều gì bạn muốn mình làm tiếp, cứ để lại bình luận nhé.</p>`, images: [c.cover + 3], visibility: 'public', status: 'published', at: addDays(TODAY, -3).toISOString(), categories: [], likes: r.int(20, 180), liked: false, comments: [] },
    { id: `${c.username}-p2`, type: 'text', title: 'Hậu trường dành cho hội viên', html: '<p>Nội dung này chỉ dành cho hội viên.</p>', images: [], visibility: 'members', status: 'published', at: addDays(TODAY, -9).toISOString(), categories: [], likes: r.int(10, 90), liked: false, comments: [] },
  ]
  const shop = [
    { id: `${c.username}-sp1`, kind: 'digital', name: 'Gói tài liệu tổng hợp', price: c.price * 3, payWhatYouWant: true, desc: 'Tệp tải về ngay sau khi thanh toán.', art: c.cover + 4, active: true, successMsg: 'Cảm ơn bạn! Đường dẫn tải đã được gửi qua thư.' },
  ]
  const gallery = Array.from({ length: 3 }, (_, i) => ({ id: `${c.username}-g${i}`, title: ['Một ngày làm việc', 'Góc bàn', 'Mẻ mới'][i], desc: '', art: c.cover + 6 + i, visibility: 'public', at: addDays(TODAY, -5 * (i + 1)).toISOString(), likes: r.int(10, 70) }))
  return {
    page: { username: c.username, name: c.name, tagline: c.tagline, category: c.category, about: c.about, avatarColor: c.avatarColor, cover: { seed: c.cover }, themeColor: c.color, item: c.item, socials: [`https://mangxahoi.vidu.vn/${c.username}`], video: '', showCount: true },
    settings: { unitPrice: c.price, presets: [1, 3, 5], thankYou: 'Cảm ơn bạn rất nhiều!', charity: { on: false }, goal: { on: false } },
    supporterCount: c.supporters, supports, membership: { enabled: true, levels }, shop: { word: 'Cửa hàng', items: shop }, posts, gallery, wishlist: [],
  }
}

export const CREATORS = RAW.map(expand)
export const CREATOR_BY_USERNAME = Object.fromEntries(CREATORS.map((c) => [c.page.username, c]))
export const TAKEN_USERNAMES = ['admin', 'quan-ly', 'kham-pha', 'dang-ky', 'dang-nhap', 'hoa', ...RAW.map((c) => c.username)]
