import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu as MenuIcon, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { Logo } from '@/components/brand/Logo'
import { UserMenu } from '@/components/layout/UserMenu'
import { cn } from '@/lib/cn'
import { DOMAIN } from '@/data/reference'
import { useAuth } from '@/store'

/** Thanh điều hướng của các trang công khai */
export function PublicNav() {
  const nav = useNavigate()
  const signedIn = useAuth((s) => s.signedIn)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const links = [['/#cach-hoat-dong', 'Cách hoạt động'], ['/kham-pha', 'Khám phá'], ['/#hoi-dap', 'Hỏi đáp']]
  const go = (e) => { e.preventDefault(); nav(`/kham-pha${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`) }
  return (
    <header className="sticky top-0 z-40 bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-4 px-4 sm:px-6">
        <Logo size={26} />
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map(([to, label]) => <a key={to} href={to} className="rounded-full px-3 py-2 text-[14px] font-[550] text-dim hover:bg-hover hover:text-fg">{label}</a>)}
        </nav>
        <form onSubmit={go} className="ml-auto hidden h-10 w-[230px] items-center gap-2 rounded-full bg-subtle px-3.5 lg:flex">
          <Search size={16} className="text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm nhà sáng tạo" aria-label="Tìm nhà sáng tạo" className="min-w-0 flex-1 bg-transparent text-[14px] outline-none" />
        </form>
        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          {signedIn ? (<><Button variant="ghost" to="/quan-ly" className="hidden sm:inline-flex">Bảng quản lý</Button><UserMenu /></>) : (
            <><Button variant="ghost" to="/dang-nhap" className="hidden min-[420px]:inline-flex">Đăng nhập</Button><Button variant="primary" to="/dang-ky">Đăng ký</Button></>
          )}
          <button onClick={() => setOpen(!open)} className="grid size-9 place-items-center rounded-full hover:bg-hover md:hidden" aria-label="Mở menu">{open ? <X size={19} /> : <MenuIcon size={19} />}</button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col border-t border-line px-4 py-2 md:hidden">
          {links.map(([to, label]) => <a key={to} href={to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-[15px] font-[550] text-dim">{label}</a>)}
        </nav>
      )}
    </header>
  )
}

/** Ô chọn tên trang: buymeaflower.vn/[tenban] + nút bắt đầu */
export function ClaimInput({ className, size = 'lg', autoFocus }) {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const submit = (e) => { e.preventDefault(); nav(`/dang-ky${name ? `?ten=${name}` : ''}`) }
  return (
    <form onSubmit={submit} className={cn('flex w-full max-w-[480px] items-center rounded-full border border-line-strong bg-surface p-1.5 shadow-md transition-shadow focus-within:shadow-lg', className)}>
      <label className="flex min-w-0 flex-1 items-center pl-4 text-[15px] sm:text-[16.5px]">
        <span className="shrink-0 font-[600] text-fg">{DOMAIN}/</span>
        <input autoFocus={autoFocus} value={name} onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))} placeholder="tenban" aria-label="Tên trang của bạn" className="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-faint" />
      </label>
      <Button type="submit" variant="primary" size={size} className="shrink-0 px-5 text-[15px]">Tạo trang</Button>
    </form>
  )
}

export function PublicFooter() {
  const cols = [
    ['Sản phẩm', [['/#cach-hoat-dong', 'Tặng hoa'], ['/#hoi-vien', 'Hội viên'], ['/#cua-hang', 'Cửa hàng'], ['/kham-pha', 'Khám phá nhà sáng tạo']]],
    ['Bắt đầu', [['/dang-ky', 'Tạo trang miễn phí'], ['/dang-nhap', 'Đăng nhập'], ['/quan-ly?demo=1', 'Xem bản demo'], ['/#hoi-dap', 'Hỏi đáp']]],
  ]
  return (
    <footer className="border-t border-line bg-side">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo size={26} />
          <p className="mt-3 max-w-sm text-[13.5px] text-muted">Nơi người hâm mộ nói lời cảm ơn bằng một bông hoa. Bản demo giao diện, mọi dữ liệu và giao dịch đều là mô phỏng; các nhà sáng tạo trên trang là nhân vật hư cấu.</p>
        </div>
        {cols.map(([h, items]) => (
          <div key={h}>
            <div className="ds-label mb-3">{h}</div>
            <ul className="space-y-2">{items.map(([to, l]) => <li key={l}>{to.includes('#') ? <a href={to} className="text-[14px] text-dim hover:text-fg">{l}</a> : <Link to={to} className="text-[14px] text-dim hover:text-fg">{l}</Link>}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-2 px-4 py-5 text-[12.5px] text-muted sm:px-6">
          <span>© 2026 Buy Me a Flower · Sản phẩm demo</span>
          <span>Thiết kế & phát triển bởi <a href="https://ntahientech.com" target="_blank" rel="noreferrer" className="font-[600] text-dim hover:text-fg">Ntahien Tech</a></span>
        </div>
      </div>
    </footer>
  )
}
