import { Suspense, useEffect } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { ExternalLink, Eye, Menu as MenuIcon, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Flower } from '@/components/brand/Flower'
import { Toaster } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useApp, useAuth, useUI } from '@/store'
import { DASH_NAV } from './nav'
import { UserMenu } from './UserMenu'

function NavList({ onNavigate }) {
  const username = useApp((s) => s.page.username)
  const unread = useApp((s) => s.conversations.reduce((a, c) => a + (c.unread || 0), 0))
  const link = 'group flex items-center gap-2.5 rounded-full px-3 h-9 text-[13.5px] font-[520] transition-colors'
  return (
    <nav className="flex flex-col gap-0.5">
      {DASH_NAV.map((g, gi) => (
        <div key={gi} className={gi ? 'mt-4' : ''}>
          {g.heading && <div className="ds-label px-3 mb-1.5">{g.heading}</div>}
          {g.items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} onClick={onNavigate}
              className={({ isActive }) => cn(link, isActive ? 'bg-brand-50 text-brand-ink' : 'text-dim hover:bg-hover hover:text-fg')}>
              {({ isActive }) => (<>
                <it.icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? 'fill-brand-200/60' : ''} />
                <span className="flex-1">{it.label}</span>
                {it.badge === 'messages' && unread > 0 && <span className="num grid place-items-center min-w-5 h-5 rounded-full bg-brand-500 px-1.5 text-[11px] font-[650] text-white">{unread}</span>}
              </>)}
            </NavLink>
          ))}
          {gi === 0 && (
            <NavLink to={`/${username}`} onClick={onNavigate} className={cn(link, 'text-dim hover:bg-hover hover:text-fg')}>
              <Eye size={17} strokeWidth={1.8} /><span className="flex-1">Xem trang</span><ExternalLink size={13} className="text-faint" />
            </NavLink>
          )}
        </div>
      ))}
    </nav>
  )
}

/** Khung khu quản lý: thanh bên + nội dung. Chưa đăng nhập thì chuyển về trang đăng nhập (trừ khi có ?demo=1). */
export default function DashLayout() {
  const { signedIn, onboarded, signInDemo } = useAuth()
  const { mobileNav, setMobileNav } = useUI()
  const [params] = useSearchParams()
  const loc = useLocation()
  const wantDemo = params.get('demo') === '1'

  useEffect(() => { if (wantDemo && !signedIn) signInDemo() }, [wantDemo, signedIn, signInDemo])
  useEffect(() => { setMobileNav(false); window.scrollTo(0, 0) }, [loc.pathname, setMobileNav])

  if (!signedIn) return wantDemo ? null : <Navigate to="/dang-nhap" replace state={{ from: loc.pathname }} />
  if (!onboarded) return <Navigate to="/hoan-thien" replace />

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur lg:hidden">
        <button onClick={() => setMobileNav(true)} className="grid size-9 place-items-center rounded-full hover:bg-hover" aria-label="Mở menu"><MenuIcon size={19} /></button>
        <Logo to="/quan-ly" size={24} />
        <div className="ml-auto"><UserMenu /></div>
      </header>

      <div className="mx-auto flex w-full max-w-[1180px] gap-8 px-4 sm:px-6">
        <aside className="sticky top-0 hidden h-dvh w-[216px] shrink-0 flex-col overflow-y-auto py-6 lg:flex no-scrollbar">
          <Logo to="/quan-ly" size={26} className="px-3 mb-6" />
          <NavList />
          <div className="mt-auto pt-6 px-3 ds-caption flex items-center gap-1.5"><Flower size={14} kind="mai" /> Bản demo · dữ liệu mô phỏng</div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="hidden h-[68px] items-center justify-end lg:flex"><UserMenu /></div>
          <main className="pb-24 pt-5 lg:pt-0">
            <Suspense fallback={<div className="card p-8"><div className="skeleton h-6 w-40 mb-4" /><div className="skeleton h-4 w-full mb-2" /><div className="skeleton h-4 w-2/3" /></div>}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>

      {mobileNav && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-[rgba(30,12,20,.4)] animate-fade-in" onClick={() => setMobileNav(false)} />
          <div className="absolute left-0 top-0 h-full w-[270px] overflow-y-auto bg-canvas p-4 shadow-lg animate-slide-up">
            <div className="mb-5 flex items-center justify-between"><Logo to="/quan-ly" size={24} />
              <button onClick={() => setMobileNav(false)} className="grid size-9 place-items-center rounded-full hover:bg-hover" aria-label="Đóng menu"><X size={18} /></button>
            </div>
            <NavList onNavigate={() => setMobileNav(false)} />
          </div>
        </div>
      )}
      <Toaster />
    </div>
  )
}
