/* ==========================================================
   Kho trạng thái (Zustand). Mọi thứ là mô phỏng, lưu trong
   localStorage của trình duyệt:
   - useUI:    giao diện sáng/tối, thanh bên trên di động
   - useToasts + toast(): thông báo nhanh
   - useAuth:  đăng nhập mô phỏng
   - useApp:   toàn bộ dữ liệu của nhà sáng tạo đang đăng nhập
   ========================================================== */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildSeed, buildFresh } from '@/data/seed'
import { CREATOR_BY_USERNAME } from '@/data/creators'
import { PLATFORM_FEE } from '@/data/reference'
import { TODAY, daysBetween, startOfDay, addDays } from '@/lib/format'

/* ---------------- Giao diện ---------------- */
function applyTheme(theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', dark ? '#170f14' : '#fdf9f4')
}

export const useUI = create(
  persist(
    (set) => ({
      theme: 'light',
      mobileNav: false,
      hideBalances: false,
      setTheme: (theme) => { applyTheme(theme); set({ theme }) },
      setMobileNav: (v) => set({ mobileNav: v }),
    }),
    { name: 'bmf-ui', partialize: (s) => ({ theme: s.theme }) },
  ),
)
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useUI.getState().theme === 'system') applyTheme('system')
  })
}

/* ---------------- Thông báo nhanh (toast) ---------------- */
let toastId = 0
export const useToasts = create((set) => ({
  items: [],
  push: (t) => {
    const id = ++toastId
    set((s) => ({ items: [...s.items, { id, tone: 'default', ...t }] }))
    setTimeout(() => set((s) => ({ items: s.items.filter((x) => x.id !== id) })), t.duration || 3800)
    return id
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}))
/** toast('Đã lưu') · toast({ title, desc, tone: 'neg' | 'info', action: { label, onClick } }) */
export function toast(t) {
  return useToasts.getState().push(typeof t === 'string' ? { title: t } : t)
}

/** Mã định danh ngắn cho bản ghi mới: uid('bv') → "bv-k3f9x2" */
export const uid = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 8)}`
/** Thời điểm hiện tại dạng ISO (bản ghi mới dùng giờ thật) */
export const nowISO = () => new Date().toISOString()

/* ---------------- Đăng nhập (mô phỏng) ---------------- */
export const useAuth = create(
  persist(
    (set) => ({
      signedIn: false,
      isDemo: true,
      onboarded: true,
      draft: {}, // bản nháp đăng ký nhiều bước: { username, email }
      /** Vào bằng tài khoản demo (Mai Chi) */
      signInDemo: () => { useApp.getState().resetDemo(); set({ signedIn: true, isDemo: true, onboarded: true }) },
      signIn: () => set({ signedIn: true }),
      /** Tạo trang mới từ đầu sau khi đăng ký */
      register: ({ username, email }) => { useApp.getState().startFresh({ username, email }); set({ signedIn: true, isDemo: false, onboarded: false, draft: {} }) },
      finishOnboarding: () => set({ onboarded: true }),
      signOut: () => set({ signedIn: false }),
      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
    }),
    { name: 'bmf-auth', partialize: (s) => ({ signedIn: s.signedIn, isDemo: s.isDemo, onboarded: s.onboarded }) },
  ),
)

/* ---------------- Dữ liệu nhà sáng tạo ---------------- */
const DATA_KEYS = ['page', 'account', 'settings', 'supports', 'followers', 'following', 'membership', 'shop', 'wishlist', 'posts', 'categories', 'gallery', 'conversations', 'payout', 'integrations', 'invites', 'stream', 'visitor']
const emptyVisitor = () => ({ given: {}, memberOf: {}, liked: {}, comments: {} })
const pickData = (s) => Object.fromEntries(DATA_KEYS.map((k) => [k, s[k]]))

export const useApp = create(
  persist(
    (set, get) => ({
      ...buildSeed(),
      /** Dấu vết của người xem trên trang của nhà sáng tạo KHÁC (ủng hộ đã gửi, hạng đã tham gia, bài đã thích) */
      visitor: emptyVisitor(),

      /**
       * Sửa dữ liệu theo kiểu "viết thẳng": mutate((d) => { d.settings.unitPrice = 30000 }).
       * d là bản sao sâu của toàn bộ dữ liệu (các khoá trong DATA_KEYS).
       */
      mutate: (fn) => set((s) => { const d = structuredClone(pickData(s)); fn(d); return d }),
      resetDemo: () => set({ ...buildSeed(), visitor: emptyVisitor() }),
      startFresh: (info) => set({ ...buildFresh(info), visitor: emptyVisitor() }),

      /**
       * Ghi nhận một lượt ủng hộ (tặng hoa / tham gia hội viên / mua sản phẩm) cho trang `username`.
       * Nếu là trang của chính mình thì cộng vào dữ liệu thật; nếu là trang người khác thì lưu ở visitor.
       */
      addSupport: (username, support) => {
        const rec = { id: uid('gd'), at: nowISO(), private: false, message: '', qty: 1, type: 'flower', avatarColor: '#e83e7c', ...support }
        get().mutate((d) => {
          if (username === d.page.username) {
            d.supports.unshift(rec)
            if (rec.type === 'membership') d.membership.members.unshift({ id: uid('hv'), name: rec.name, email: rec.email || '', avatarColor: rec.avatarColor, levelId: rec.levelId, since: rec.at, status: 'active' })
            if (rec.type === 'shop') d.shop.claims.unshift({ id: uid('dh'), itemId: rec.itemId, name: rec.name, email: rec.email || '', avatarColor: rec.avatarColor, amount: rec.amount, at: rec.at, answer: rec.answer || '', status: 'paid' })
          } else {
            (d.visitor.given[username] ||= []).unshift(rec)
            if (rec.type === 'membership') d.visitor.memberOf[username] = rec.levelId
          }
        })
        return rec
      },
      toggleFollow: (username) => get().mutate((d) => {
        const i = d.following.findIndex((f) => f.username === username)
        if (i >= 0) d.following.splice(i, 1); else d.following.unshift({ username, since: nowISO() })
      }),
    }),
    { name: 'bmf-data', version: 1, partialize: pickData, migrate: () => ({ ...buildSeed(), visitor: emptyVisitor() }) },
  ),
)

/* ---------------- Hàm tính toán dùng chung ---------------- */
/** Tiền thực nhận sau phí nền tảng */
export const netOf = (amount) => Math.round(amount * (1 - PLATFORM_FEE))

/** Tổng hợp thu nhập: { total, flower, membership, shop, count } trong `days` ngày gần nhất (0 = toàn thời gian) */
export function summarize(supports, days = 30) {
  const from = days ? addDays(startOfDay(new Date(Math.max(Date.now(), TODAY.getTime()))), -days + 1) : null
  const out = { total: 0, flower: 0, membership: 0, shop: 0, count: 0 }
  for (const s of supports) {
    if (from && new Date(s.at) < from) continue
    out.total += s.amount; out[s.type] = (out[s.type] || 0) + s.amount; out.count++
  }
  return out
}

/** Chuỗi theo ngày cho biểu đồ: [{ date, label, value }] */
export function dailySeries(supports, days = 30, filter) {
  const end = startOfDay(new Date(Math.max(Date.now(), TODAY.getTime())))
  const out = Array.from({ length: days }, (_, i) => {
    const d = addDays(end, -(days - 1 - i))
    return { date: d, label: `${d.getDate()}/${d.getMonth() + 1}`, value: 0 }
  })
  for (const s of supports) {
    if (filter && !filter(s)) continue
    const idx = days - 1 - daysBetween(startOfDay(new Date(s.at)), end)
    if (idx >= 0 && idx < days) out[idx].value += s.amount
  }
  return out
}

/** Số dư có thể rút = tổng thực nhận − tổng đã rút */
export function balanceOf(state) {
  const earned = state.supports.reduce((a, s) => a + netOf(s.amount), 0)
  const paid = state.payout.history.reduce((a, p) => a + p.amount, 0)
  return Math.max(0, earned - paid)
}

/** Số người ủng hộ duy nhất */
export const supporterCount = (supports) => new Set(supports.map((s) => s.email || s.name)).size

/**
 * Dữ liệu để dựng trang cá nhân công khai của `username`.
 * Trả về { ...creator, isOwner } hoặc null nếu không có trang đó.
 */
export function resolveCreator(state, username) {
  if (username === state.page.username) {
    return { page: state.page, settings: state.settings, supports: state.supports, supporterCount: supporterCount(state.supports), membership: state.membership, shop: state.shop, posts: state.posts, gallery: state.gallery, wishlist: state.wishlist, isOwner: true }
  }
  const c = CREATOR_BY_USERNAME[username]
  if (!c) return null
  const mine = state.visitor.given[username] || []
  return { ...c, supports: [...mine, ...c.supports], supporterCount: c.supporterCount + mine.length, isOwner: false }
}
