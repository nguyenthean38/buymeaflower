/* Dữ liệu mẫu của tài khoản demo (hoạ sĩ Mai Chi). Sinh bằng hạt giống cố định nên mỗi lần tải đều giống nhau. */
import { seeded } from '@/lib/random'
import { TODAY, addDays } from '@/lib/format'
import { AVATAR_COLORS } from './reference'

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương']
const TEN = ['An', 'Bình', 'Châu', 'Dung', 'Giang', 'Hà', 'Hạnh', 'Hiếu', 'Khoa', 'Lan', 'Linh', 'Long', 'Minh', 'My', 'Nam', 'Ngân', 'Nhi', 'Phúc', 'Quân', 'Quỳnh', 'Sơn', 'Tâm', 'Thảo', 'Thu', 'Trang', 'Trí', 'Tú', 'Uyên', 'Vy', 'Yến']
const DEM = ['Thị', 'Văn', 'Minh', 'Ngọc', 'Thanh', 'Hoài', 'Gia', 'Bảo', 'Khánh', 'Thuỳ']
const LOI_NHAN = [
  'Tranh của chị làm em nhớ Hà Nội quá. Cảm ơn chị!', 'Mỗi sáng mở điện thoại thấy hình nền của bạn là thấy vui.', 'Ủng hộ bạn vẽ tiếp series quán nước vỉa hè nhé!',
  'Chúc chị nhiều sức khoẻ, vẽ thật nhiều.', 'Tặng chị bó hoa nhỏ, mong sớm có sách tranh.', 'Em học được nhiều từ bài hậu trường tuần trước.',
  'Cảm ơn vì bộ cọ miễn phí!', 'Bức “Chiều Hồ Gươm” đẹp quá ạ.', 'Mình in tranh của bạn treo ở phòng làm việc rồi.', 'Cố lên nhé, mình luôn theo dõi.',
  '', '', '', 'Mong chị mở lớp màu nước online.', 'Quà nhỏ cho ly cà phê sáng (à nhầm, bó hoa sáng).', 'Vẽ Sài Gòn nữa đi bạn ơi!',
]

export function personName(r) {
  return `${r.pick(HO)} ${r.chance(0.55) ? r.pick(DEM) + ' ' : ''}${r.pick(TEN)}`
}
const emailOf = (name, r) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().split(' ').slice(-2).join('.') + r.int(10, 99) + '@thu.vidu.vn'
const iso = (d) => new Date(d).toISOString()

export function buildSeed() {
  const r = seeded(20261112)
  const unitPrice = 20000

  const levels = [
    { id: 'lv-nu', name: 'Nụ', price: 30000, yearly: 300000, desc: 'Cùng mình giữ thói quen vẽ mỗi ngày và xem những bản phác chưa từng đăng.', rewards: ['Ủng hộ mình hằng tháng', 'Mở khoá bài viết và tin nhắn riêng', 'Xem bản nháp đang làm dở'], limit: null, welcome: 'Cảm ơn bạn đã thành hội viên hạng Nụ! 🌱', published: true, art: 11 },
    { id: 'lv-hoa', name: 'Hoa', price: 79000, yearly: 790000, desc: 'Nhận trọn bộ hình nền mỗi tháng và video quay lại quá trình vẽ.', rewards: ['Mọi quyền lợi của hạng Nụ', 'Bộ hình nền mới mỗi tháng', 'Video hậu trường', 'Giảm 20% sản phẩm trong cửa hàng'], limit: null, welcome: 'Chào mừng bạn đến với hạng Hoa! Bộ hình nền tháng này ở ngay bài ghim nhé. 🌸', published: true, art: 12 },
    { id: 'lv-vuon', name: 'Vườn', price: 199000, yearly: 1990000, desc: 'Dành cho những người bạn muốn đồng hành thật gần: thiệp vẽ tay gửi về nhà mỗi quý.', rewards: ['Mọi quyền lợi của hạng Hoa', 'Thiệp vẽ tay gửi về nhà mỗi quý', 'Nêu tên cảm ơn trong sách tranh', 'Xem toàn bộ thư viện'], limit: 30, welcome: 'Cảm ơn bạn rất nhiều! Hãy trả lời tin nhắn này bằng địa chỉ nhận thiệp nhé. 💐', published: true, art: 13 },
  ]

  const shopItems = [
    { id: 'sp-hinhnen', kind: 'digital', name: 'Bộ 12 hình nền “Mùa hoa”', price: 49000, payWhatYouWant: true, desc: 'Mười hai hình nền điện thoại và máy tính, độ phân giải 4K, mỗi tháng một loài hoa.', art: 21, active: true, successMsg: 'Cảm ơn bạn! Đường dẫn tải về đã được gửi vào hộp thư.', question: '', limit: null, memberPrice: 0, ratings: true },
    { id: 'sp-chandung', kind: 'commission', name: 'Vẽ chân dung màu nước', price: 450000, payWhatYouWant: false, desc: 'Một bức chân dung màu nước theo ảnh bạn gửi, giao tệp in trong 7 ngày.', art: 22, active: true, successMsg: 'Mình sẽ nhắn bạn trong 24 giờ để nhận ảnh mẫu.', question: 'Bạn muốn vẽ ai, và có ghi chú gì về màu sắc không?', limit: 8, memberPrice: 360000, ratings: true },
    { id: 'sp-lop', kind: 'ticket', name: 'Buổi vẽ chung trực tuyến tháng 11', price: 99000, payWhatYouWant: false, desc: 'Chín mươi phút cùng vẽ một giỏ cúc hoạ mi, người mới cầm cọ vẫn theo được.', art: 23, active: true, successMsg: 'Hẹn gặp bạn tối thứ Bảy! Đường dẫn phòng học ở trong thư xác nhận.', question: '', limit: 40, memberPrice: 0, ratings: false },
    { id: 'sp-co', kind: 'digital', name: 'Bộ cọ vẽ kỹ thuật số', price: 0, payWhatYouWant: true, desc: 'Mười tám đầu cọ mình dùng hằng ngày. Tải miễn phí, tuỳ tâm ủng hộ.', art: 24, active: false, successMsg: 'Chúc bạn vẽ vui!', question: '', limit: null, memberPrice: 0, ratings: true },
  ]

  /* Lượt ủng hộ trong 120 ngày gần đây */
  const supports = []
  const members = []
  const claims = []
  for (let day = 120; day >= 0; day--) {
    const n = r.chance(0.42) ? r.int(1, day < 20 ? 3 : 2) : 0
    for (let i = 0; i < n; i++) {
      const name = personName(r)
      const at = new Date(addDays(TODAY, -day)); at.setHours(r.int(7, 22), r.int(0, 59))
      if (at > TODAY) at.setTime(TODAY.getTime() - r.int(5, 240) * 60000)
      const roll = r.next()
      const base = { id: `gd-${supports.length + 1}`, name, email: emailOf(name, r), avatarColor: r.pick(AVATAR_COLORS), at: iso(at), private: r.chance(0.1) }
      if (roll < 0.66) {
        const qty = r.pick([1, 1, 1, 2, 3, 3, 5, 5, 10])
        supports.push({ ...base, type: 'flower', qty, amount: qty * unitPrice, message: r.pick(LOI_NHAN) })
      } else if (roll < 0.86) {
        const lv = r.pick([levels[0], levels[0], levels[1], levels[1], levels[2]])
        supports.push({ ...base, type: 'membership', levelId: lv.id, qty: 1, amount: lv.price, message: '' })
        if (!members.find((m) => m.email === base.email)) members.push({ id: `hv-${members.length + 1}`, name, email: base.email, avatarColor: base.avatarColor, levelId: lv.id, since: base.at, status: 'active' })
      } else {
        const it = r.pick(shopItems.filter((s) => s.price > 0))
        supports.push({ ...base, type: 'shop', itemId: it.id, qty: 1, amount: it.price, message: '' })
        claims.push({ id: `dh-${claims.length + 1}`, itemId: it.id, name, email: base.email, avatarColor: base.avatarColor, amount: it.price, at: base.at, answer: it.question ? 'Vẽ mẹ mình, tông màu ấm ạ.' : '', status: 'paid' })
      }
    }
  }
  supports.reverse(); claims.reverse()
  if (supports[1]) supports[1].reply = 'Cảm ơn bạn nhiều lắm! 🌸'
  members.push({ id: 'hv-tang', name: 'Lê Hoài Thu', email: 'hoai.thu21@thu.vidu.vn', avatarColor: '#8a5cd6', levelId: 'lv-hoa', since: iso(addDays(TODAY, -9)), status: 'gift' })

  const followers = Array.from({ length: 14 }, (_, i) => {
    const name = personName(r)
    return { id: `tv-${i + 1}`, name, email: emailOf(name, r), avatarColor: r.pick(AVATAR_COLORS), since: iso(addDays(TODAY, -r.int(1, 200))) }
  })

  const posts = [
    { id: 'bv-1', type: 'text', title: 'Hậu trường: bức “Chiều Hồ Gươm” mất 3 tuần như thế nào', html: '<p>Chào cả nhà,</p><p>Tuần này mình kể chuyện bức tranh khổ lớn nhất từ đầu năm. Mình bắt đầu bằng <strong>mười hai bản phác chì</strong>, bỏ đi mười một.</p><h2>Ba điều mình rút ra</h2><ul><li>Phác nhỏ trước, đừng tiếc giấy.</li><li>Màu nước cần chờ; vội là hỏng.</li><li>Ánh sáng lúc 5 giờ chiều ở hồ chỉ kéo dài chừng hai mươi phút.</li></ul><blockquote>“Vẽ là học cách nhìn chậm lại.”</blockquote><p>Hội viên hạng Hoa có video quay nhanh cả quá trình ở bài kế tiếp nhé.</p>', images: [31], visibility: 'public', status: 'published', at: iso(addDays(TODAY, -2)), categories: ['Hậu trường'], likes: 48, liked: false, pinned: true, comments: [{ id: 'bl-1', name: 'Trần Ngọc Hà', avatarColor: '#4a78e0', text: 'Đọc xong muốn ra hồ ngồi vẽ liền!', at: iso(addDays(TODAY, -1)) }, { id: 'bl-2', name: 'Phạm Quân', avatarColor: '#2f9e6e', text: 'Chị cho em hỏi giấy chị dùng loại nào ạ?', at: iso(addDays(TODAY, -1)) }] },
    { id: 'bv-2', type: 'album', title: 'Bộ hình nền tháng 11: cúc hoạ mi', html: '<p>Sáu hình nền cho điện thoại, hội viên tải bản 4K ở cuối bài.</p>', images: [32, 33, 34, 35], visibility: 'members', status: 'published', at: iso(addDays(TODAY, -6)), categories: ['Hình nền'], likes: 73, liked: true, pinned: false, comments: [] },
    { id: 'bv-3', type: 'audio', title: 'Tản mạn #4: vì sao mình bỏ việc văn phòng để vẽ', html: '<p>Mười bốn phút trò chuyện, thu ở ban công lúc trời mưa.</p>', images: [36], audio: { duration: 846 }, visibility: 'supporters', status: 'published', at: iso(addDays(TODAY, -11)), categories: ['Tản mạn'], likes: 31, liked: false, pinned: false, comments: [{ id: 'bl-3', name: 'Vũ Thuỳ Linh', avatarColor: '#e0a019', text: 'Nghe tiếng mưa dễ chịu ghê.', at: iso(addDays(TODAY, -10)) }] },
    { id: 'bv-4', type: 'text', title: 'Cảm ơn 300 người bạn đầu tiên', html: '<p>Mình không nghĩ trang này có ngày đông vui thế. Cảm ơn từng bông hoa các bạn gửi. 🌸</p>', images: [], visibility: 'public', status: 'published', at: iso(addDays(TODAY, -19)), categories: [], likes: 112, liked: false, pinned: false, comments: [] },
    { id: 'bv-5', type: 'text', title: 'Kế hoạch sách tranh “Mười hai tháng hoa”', html: '<p>Bản nháp mục lục và lịch làm việc…</p>', images: [], visibility: 'members', status: 'draft', at: iso(addDays(TODAY, -1)), categories: ['Sách tranh'], likes: 0, liked: false, pinned: false, comments: [] },
    { id: 'bv-6', type: 'text', title: 'Mở đặt trước lịch treo tường 2027', html: '<p>Mười hai tờ, mỗi tháng một loài hoa. Hội viên được giảm 20%.</p>', images: [37], visibility: 'public', status: 'scheduled', at: iso(addDays(TODAY, 0)), scheduledAt: iso(addDays(TODAY, 3)), categories: ['Thông báo'], likes: 0, liked: false, pinned: false, comments: [] },
  ]

  const gallery = [
    { id: 'anh-1', title: 'Tulip vàng', desc: 'Màu nước trên giấy 300gsm, 30×40 cm.', art: 41, visibility: 'public', at: iso(addDays(TODAY, -3)), likes: 86, downloadable: false },
    { id: 'anh-2', title: 'Tiệm hoa đầu ngõ', desc: 'Ảnh tư liệu mình chụp để vẽ bức tuần sau.', art: 42, visibility: 'public', at: iso(addDays(TODAY, -8)), likes: 54, downloadable: true },
    { id: 'anh-3', title: 'Lupin tím', desc: 'Bản gốc dành cho hội viên tải về.', art: 43, visibility: 'members', at: iso(addDays(TODAY, -15)), likes: 39, downloadable: true },
    { id: 'anh-4', title: 'Bên cửa sổ tháng Ba', desc: '', art: 44, visibility: 'public', at: iso(addDays(TODAY, -24)), likes: 61, downloadable: false },
    { id: 'anh-5', title: 'Sau cơn mưa', desc: 'Phác nhanh 20 phút.', art: 45, visibility: 'supporters', at: iso(addDays(TODAY, -31)), likes: 27, downloadable: false },
    { id: 'anh-6', title: 'Vườn tím', desc: '', art: 46, visibility: 'public', at: iso(addDays(TODAY, -40)), likes: 45, downloadable: false },
  ]

  const conversations = [
    { id: 'tn-1', with: { name: 'Trần Ngọc Hà', email: 'ngoc.ha42@thu.vidu.vn', avatarColor: '#4a78e0' }, unread: 1, messages: [
      { id: 'm1', from: 'me', text: 'Cảm ơn Hà đã lên hạng Vườn nhé! Bạn gửi mình địa chỉ nhận thiệp được không?', at: iso(addDays(TODAY, -2)) },
      { id: 'm2', from: 'them', text: 'Dạ, em gửi về 12 ngõ Hoa Sữa, phường Cầu Giấy, Hà Nội ạ. Em mong thiệp lắm!', at: iso(new Date(TODAY.getTime() - 50 * 60000)) },
    ] },
    { id: 'tn-2', group: 'members', unread: 0, messages: [
      { id: 'm1', from: 'me', text: 'Bộ hình nền tháng 11 đã lên rồi cả nhà ơi. Chúc mọi người một tuần nhiều hoa!', at: iso(addDays(TODAY, -6)) },
    ] },
    { id: 'tn-3', with: { name: 'Phạm Quân', email: 'pham.quan77@thu.vidu.vn', avatarColor: '#2f9e6e' }, unread: 0, messages: [
      { id: 'm1', from: 'them', text: 'Chị ơi em đặt vẽ chân dung, khoảng bao lâu thì có ạ?', at: iso(addDays(TODAY, -4)) },
      { id: 'm2', from: 'me', text: 'Chào Quân, thường là 7 ngày kể từ lúc mình nhận ảnh mẫu nhé.', at: iso(addDays(TODAY, -4)) },
    ] },
  ]

  const wishlist = [
    { id: 'mu-1', name: 'Bảng vẽ màn hình 16 inch', price: 18500000, raised: 6200000, desc: 'Để vẽ sách tranh nhanh hơn và không phải scan từng trang.', art: 51 },
    { id: 'mu-2', name: 'Hộp màu nước 48 ô', price: 2400000, raised: 2400000, desc: 'Đã đủ rồi! Cảm ơn mọi người.', art: 52 },
  ]

  return {
    page: {
      username: 'maichi', name: 'Mai Chi', tagline: 'đang vẽ những góc phố Việt Nam có hoa', category: 'Minh hoạ',
      about: 'Chào bạn! Mình là Chi, hoạ sĩ minh hoạ ở Hà Nội.\n\nMình vẽ màu nước về những góc phố, gánh hàng rong và các loài hoa theo mùa. Mỗi bông hoa bạn tặng giúp mình mua giấy, màu và dành trọn thời gian cho cuốn sách tranh “Mười hai tháng hoa”.',
      avatarColor: '#e83e7c', cover: { seed: 7, variant: 'field' }, themeColor: '#e83e7c', item: { emoji: '🌸', name: 'bông hoa' },
      socials: ['https://instagram.vidu.vn/maichi.ve', 'https://youtube.vidu.vn/@maichive'], video: '', showCount: true,
    },
    account: { email: 'maichi@thu.vidu.vn', country: 'Việt Nam', timezone: 'GMT+7 (Hà Nội)', language: 'Tiếng Việt', joined: iso(addDays(TODAY, -212)) },
    settings: {
      unitPrice, presets: [1, 3, 5], thankYou: 'Cảm ơn bạn đã tặng hoa! Mỗi bông đều giúp mình vẽ thêm một góc phố. 🌸',
      charity: { on: false, percent: 10, name: 'Quỹ Trồng cây cho trường vùng cao' },
      goal: { on: true, title: 'In 500 cuốn sách tranh “Mười hai tháng hoa”', desc: 'Khi đủ 30 triệu, mình sẽ đặt in đợt đầu và gửi tặng thư viện 20 trường tiểu học.', target: 30000000, start: 11400000 },
      coverFee: true, adult: false, analyticsId: '', currency: 'VND',
      notify: { all: true, newSupport: true, newMember: true, newComment: true, newMessage: true, limit: 'all' },
      messaging: 'supporters',
    },
    supports, followers,
    following: [{ username: 'banhmique', since: iso(addDays(TODAY, -60)) }, { username: 'ducanhguitar', since: iso(addDays(TODAY, -33)) }],
    membership: { enabled: true, levels, members, settings: { annual: true, showCount: true, showEarnings: false, paused: {} } },
    shop: { word: 'Cửa hàng', items: shopItems, claims },
    wishlist, posts, categories: ['Hậu trường', 'Hình nền', 'Tản mạn', 'Sách tranh', 'Thông báo'], gallery, conversations,
    payout: { connected: true, bank: { bankId: 'hoasen', number: '0907 2026 1112', holder: 'NGUYEN MAI CHI' }, schedule: 'weekly', history: [
      { id: 'rt-1', amount: 1200000, at: iso(addDays(TODAY, -35)), status: 'done' },
      { id: 'rt-2', amount: 950000, at: iso(addDays(TODAY, -70)), status: 'done' },
    ] },
    integrations: { discord: false, zalo: true, wordpress: false, webhook: false, sheets: false, stream: false },
    invites: { code: 'maichi', referred: [{ id: 'gt-1', name: 'Đỗ Bảo Long', username: 'baolongpiano', joined: iso(addDays(TODAY, -41)), earned: 86000, active: true }], paid: 0 },
    stream: { sound: 'Chuông gió', duration: 6 },
  }
}

/** Trang trắng cho người vừa đăng ký */
export function buildFresh({ username, name, email }) {
  return {
    page: { username, name: name || username, tagline: '', category: 'Minh hoạ', about: '', avatarColor: '#e83e7c', cover: null, themeColor: '#e83e7c', item: { emoji: '🌸', name: 'bông hoa' }, socials: [], video: '', showCount: true },
    account: { email, country: 'Việt Nam', timezone: 'GMT+7 (Hà Nội)', language: 'Tiếng Việt', joined: new Date().toISOString() },
    settings: { unitPrice: 20000, presets: [1, 3, 5], thankYou: 'Cảm ơn bạn đã tặng hoa! 🌸', charity: { on: false, percent: 10, name: '' }, goal: { on: false, title: '', desc: '', target: 0, start: 0 }, coverFee: true, adult: false, analyticsId: '', currency: 'VND', notify: { all: true, newSupport: true, newMember: true, newComment: true, newMessage: true, limit: 'all' }, messaging: 'creator' },
    supports: [], followers: [], following: [],
    membership: { enabled: false, levels: [], members: [], settings: { annual: true, showCount: false, showEarnings: false, paused: {} } },
    shop: { word: 'Cửa hàng', items: [], claims: [] },
    wishlist: [], posts: [], categories: [], gallery: [], conversations: [],
    payout: { connected: false, bank: null, schedule: 'weekly', history: [] },
    integrations: { discord: false, zalo: false, wordpress: false, webhook: false, sheets: false, stream: false },
    invites: { code: username, referred: [], paid: 0 },
    stream: { sound: 'Chuông gió', duration: 6 },
  }
}
