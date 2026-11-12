import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Crown, Store, Star } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { Logo } from '@/components/brand/Logo'
import { Flower, FlowerArt } from '@/components/brand/Flower'
import { cn } from '@/lib/cn'

const SLIDES = [
  { icon: Heart, title: 'Tặng hoa', desc: 'Một cách dễ thương để khán giả nói lời cảm ơn.', art: 7 },
  { icon: Crown, title: 'Hội viên', desc: 'Thu nhập đều đặn từ những người thương bạn nhất.', art: 12 },
  { icon: Store, title: 'Cửa hàng', desc: 'Bán tệp số, lịch hẹn hay tranh vẽ theo yêu cầu.', art: 21 },
]

/**
 * Khung chia đôi cho đăng ký: bên trái là bảng giới thiệu màu thương hiệu, bên phải là biểu mẫu.
 * <AuthShell topRight={<…/>} footer={<…/>}>biểu mẫu</AuthShell>
 */
export function AuthShell({ children, topRight, footer }) {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 3600); return () => clearInterval(t) }, [])
  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-[minmax(380px,34%)_1fr]">
      <aside className="relative hidden flex-col overflow-hidden bg-brand-500 p-8 text-white lg:flex dark:bg-brand-200">
        <Flower kind="dao" size={300} color="rgba(255,255,255,.12)" center="rgba(255,255,255,.14)" className="absolute -right-24 -top-20" spin />
        <Flower kind="cuc" size={240} color="rgba(255,255,255,.1)" center="rgba(255,255,255,.14)" className="absolute -bottom-16 -left-20" spin />
        <Logo light size={26} className="relative [&_svg_g]:fill-white" />
        <div className="relative my-auto">
          <div className="mx-auto w-full max-w-[300px] rounded-3xl bg-white p-4 text-[#2b1622] shadow-lg">
            {SLIDES.map((s, k) => k === i && (
              <div key={s.title} className="animate-fade-in">
                <FlowerArt seed={s.art} className="h-36 w-full rounded-2xl" />
                <div className="mt-3 flex items-center gap-2 text-[16px] font-[700]"><s.icon size={17} className="text-[#e83e7c]" />{s.title}</div>
                <p className="mt-1 text-[13.5px] text-[#7d6570]">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-center gap-1.5">
            {SLIDES.map((s, k) => <button key={s.title} onClick={() => setI(k)} aria-label={s.title} className={cn('h-1.5 rounded-full bg-white transition-all', k === i ? 'w-6' : 'w-1.5 opacity-50')} />)}
          </div>
        </div>
        <div className="relative flex items-center gap-3">
          <div className="flex -space-x-2">{[['Bánh Mì Quê', '#e0523a'], ['Đức Anh Guitar', '#4a78e0'], ['Len và Que', '#e0a019'], ['Mai Chi', '#8a5cd6']].map(([n, c]) => <Avatar key={n} name={n} color={c} size={30} className="ring-2 ring-brand-500" />)}</div>
          <div className="text-[13px]"><div className="flex">{[0, 1, 2, 3, 4].map((x) => <Star key={x} size={13} className="fill-white" />)}</div>Nơi nhà sáng tạo Việt nhận hoa</div>
        </div>
      </aside>
      <main className="flex min-h-dvh flex-col">
        <div className="flex h-16 items-center justify-between px-5 sm:px-8">
          <Logo size={24} className="lg:hidden" /><span className="hidden lg:block" />
          <div className="text-[13.5px] text-muted">{topRight}</div>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8"><div className="w-full max-w-[400px]">{children}</div></div>
        {footer && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-8">{footer}</div>}
      </main>
    </div>
  )
}

/** Khung giữa trang cho đăng nhập / quên mật khẩu */
export function CenterShell({ children, topRight }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-canvas">
      <Flower kind="dao" size={260} className="pointer-events-none absolute -left-20 top-24 opacity-10" spin />
      <Flower kind="mai" size={200} className="pointer-events-none absolute -right-14 bottom-10 opacity-10" spin />
      <div className="relative flex h-16 items-center justify-between px-5 sm:px-8"><Logo size={24} /><div className="text-[13.5px] text-muted">{topRight}</div></div>
      <div className="relative flex flex-1 items-center justify-center px-5 py-8"><div className="w-full max-w-[380px]">{children}</div></div>
      <p className="relative pb-6 text-center ds-caption">Bản demo · <Link to="/" className="hover:underline">Về trang giới thiệu</Link></p>
    </div>
  )
}

/** Các nút đăng nhập nhanh (mô phỏng, không gắn với dịch vụ thật) */
export function SocialButtons({ onPick, verb = 'Tiếp tục' }) {
  const items = [['thư điện tử', '✉️'], ['mạng xã hội', '💬'], ['số điện thoại', '📱']]
  return (
    <div className="space-y-2">
      {items.map(([name, icon]) => (
        <button key={name} type="button" onClick={() => onPick(name)} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-line-strong bg-surface text-[14px] font-[550] transition-colors hover:bg-subtle">
          <span aria-hidden>{icon}</span>{verb} bằng tài khoản {name}
        </button>
      ))}
    </div>
  )
}
