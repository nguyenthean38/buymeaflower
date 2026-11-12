import { useNavigate } from 'react-router-dom'
import { Eye, LayoutDashboard, UserRound, Megaphone, LogOut, Moon, Sun, RotateCcw, Menu as MenuIcon } from 'lucide-react'
import { Avatar, Popover, Menu } from '@/components/ui'
import { useApp, useAuth, useUI, toast } from '@/store'

/** Nút avatar góc phải + menu tài khoản (dùng ở cả trang cá nhân lẫn khu quản lý). */
export function UserMenu() {
  const nav = useNavigate()
  const page = useApp((s) => s.page)
  const { isDemo, signOut } = useAuth()
  const { theme, setTheme } = useUI()
  const dark = theme === 'dark'
  return (
    <Popover align="end" width={236}
      trigger={(p) => (
        <button {...p} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-2.5 pr-1 hover:bg-subtle transition-colors" aria-label="Mở menu tài khoản">
          <MenuIcon size={16} className="text-muted" />
          <Avatar name={page.name} color={page.avatarColor} size={28} />
        </button>
      )}>
      {(close) => (
        <Menu onClose={close} items={[
          { heading: `@${page.username}` },
          { label: 'Xem trang của tôi', icon: Eye, onClick: () => nav(`/${page.username}`) },
          { label: 'Bảng quản lý', icon: LayoutDashboard, onClick: () => nav('/quan-ly') },
          { label: 'Tài khoản', icon: UserRound, onClick: () => nav('/quan-ly/tai-khoan') },
          { label: 'Giới thiệu bạn, nhận hoa hồng', icon: Megaphone, onClick: () => nav('/quan-ly/gioi-thieu') },
          { divider: true },
          { label: dark ? 'Giao diện sáng' : 'Giao diện tối', icon: dark ? Sun : Moon, onClick: () => setTheme(dark ? 'light' : 'dark'), keepOpen: true },
          isDemo && { label: 'Đặt lại dữ liệu demo', icon: RotateCcw, onClick: () => { useApp.getState().resetDemo(); toast('Đã đặt lại dữ liệu demo') } },
          { divider: true },
          { label: 'Đăng xuất', icon: LogOut, onClick: () => { signOut(); nav('/') } },
        ]} />
      )}
    </Popover>
  )
}
