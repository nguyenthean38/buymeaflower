import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Share2, Pencil, Plus, Lock, Heart, MessageCircle, Play, Pause, RotateCcw, RotateCw, Pin, Images, Headphones, Newspaper, Store, Image as ImageIcon, QrCode as QrIcon, Link2 } from 'lucide-react'
import { Button, Popover, Menu, Modal, QrCode, Badge } from '@/components/ui'
import { Logo } from '@/components/brand/Logo'
import { Flower, FlowerArt } from '@/components/brand/Flower'
import { UserMenu } from '@/components/layout/UserMenu'
import { cn } from '@/lib/cn'
import { timeAgo } from '@/lib/format'
import { DOMAIN, VISIBILITY_LABEL } from '@/data/reference'
import { useApp, useAuth } from '@/store'
import { copyText } from '@/features/support/SupportBox'

/** Quyền xem của người đang mở trang: chủ trang, người đã ủng hộ, hội viên */
export function useAccess(creator) {
  const signedIn = useAuth((s) => s.signedIn)
  const visitor = useApp((s) => s.visitor)
  const u = creator.page.username
  const owner = creator.isOwner && signedIn
  const member = owner || !!visitor.memberOf[u]
  const supporter = member || (visitor.given[u]?.length > 0)
  const canSee = (vis) => vis === 'public' || (vis === 'supporters' && supporter) || (vis === 'members' && member)
  return { owner, member, supporter, canSee, memberLevel: visitor.memberOf[u] }
}

export function ShareMenu({ page, children }) {
  const [qr, setQr] = useState(false)
  const url = `https://${DOMAIN}/${page.username}`
  return (
    <>
      <Popover align="end" width={220} trigger={children}>
        {(close) => <Menu onClose={close} items={[
          { label: 'Sao chép liên kết', icon: Link2, onClick: () => copyText(url, 'Đã sao chép liên kết trang') },
          { label: 'Lấy mã QR', icon: QrIcon, onClick: () => setQr(true) },
        ]} />}
      </Popover>
      <Modal open={qr} onClose={() => setQr(false)} title="Mã QR của trang" desc="In ra hoặc đặt ở quầy, cuối video để người xem quét và tặng hoa." size="sm">
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="relative rounded-2xl border border-line bg-white p-4 text-[#2b1622]">
            <QrCode value={url} size={190} />
            <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white"><Flower size={30} /></span>
          </div>
          <div className="num text-[13.5px] text-muted">{DOMAIN}/{page.username}</div>
          <Button variant="primary" onClick={() => copyText(url, 'Đã sao chép liên kết trang')}>Sao chép liên kết</Button>
        </div>
      </Modal>
    </>
  )
}

/** Thanh trên cùng của trang cá nhân */
export function CreatorTopBar({ creator, owner, onEdit }) {
  const nav = useNavigate()
  const signedIn = useAuth((s) => s.signedIn)
  const { page } = creator
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1040px] items-center gap-2 px-4">
        <Logo size={24} wordmark={false} />
        <Link to={`/${page.username}`} className="ml-1 truncate text-[14.5px] font-[650]">{page.name}</Link>
        <div className="ml-auto flex items-center gap-1.5">
          <ShareMenu page={page}>{(p) => <Button {...p} variant="ghost" size="sm" icon={Share2}><span className="hidden sm:inline">Chia sẻ</span></Button>}</ShareMenu>
          {owner ? (
            <>
              <Button variant="outline" size="sm" icon={Pencil} onClick={onEdit}><span className="hidden sm:inline">Sửa trang</span></Button>
              <Popover align="end" width={210} trigger={(p) => <Button {...p} variant="primary" size="sm" icon={Plus}>Tạo</Button>}>
                {(close) => <Menu onClose={close} items={[
                  { label: 'Bài viết', icon: Newspaper, onClick: () => nav('/quan-ly/bai-viet/moi?loai=text') },
                  { label: 'Album ảnh', icon: Images, onClick: () => nav('/quan-ly/bai-viet/moi?loai=album') },
                  { label: 'Bài âm thanh', icon: Headphones, onClick: () => nav('/quan-ly/bai-viet/moi?loai=audio') },
                  { label: 'Ảnh trong bộ ảnh', icon: ImageIcon, onClick: () => nav('/quan-ly/bo-anh') },
                  { label: 'Sản phẩm', icon: Store, onClick: () => nav('/quan-ly/cua-hang') },
                ]} />}
              </Popover>
              <UserMenu />
            </>
          ) : signedIn ? <UserMenu /> : (
            <>
              <Button variant="ghost" size="sm" to="/dang-nhap">Đăng nhập</Button>
              <Button variant="inverse" size="sm" to="/dang-ky" className="hidden sm:inline-flex">Tạo trang của bạn</Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function CreatorFooter({ page }) {
  return (
    <footer className="mx-auto mt-16 flex max-w-[1040px] flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 pb-10 text-[12.5px] text-muted">
      <span>© 2026 {page.name}</span>
      <Link to="/" className="inline-flex items-center gap-1.5 hover:text-fg"><Flower size={14} /> Tạo trang Buy Me a Flower của bạn</Link>
      <Link to="/kham-pha" className="hover:text-fg">Khám phá</Link>
      <span>Bản demo · dữ liệu mô phỏng</span>
    </footer>
  )
}

/** Trình phát âm thanh mô phỏng (chạy theo đồng hồ, không có tệp âm thanh thật) */
export function AudioPlayer({ duration = 180, seed = 1, className }) {
  const [pos, setPos] = useState(0)
  const [playing, setPlaying] = useState(false)
  const t = useRef(null)
  useEffect(() => {
    if (!playing) return
    t.current = setInterval(() => setPos((p) => { if (p >= duration) { setPlaying(false); return duration } return p + 1 }), 1000)
    return () => clearInterval(t.current)
  }, [playing, duration])
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  const jump = (d) => setPos((p) => Math.max(0, Math.min(duration, p + d)))
  return (
    <div className={cn('flex items-center gap-4 overflow-hidden rounded-2xl bg-fg p-3 text-canvas', className)}>
      <FlowerArt seed={seed} className="size-20 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => jump(-10)} aria-label="Lùi 10 giây" className="opacity-80 hover:opacity-100"><RotateCcw size={18} /></button>
          <button onClick={() => { if (pos >= duration) setPos(0); setPlaying(!playing) }} aria-label={playing ? 'Tạm dừng' : 'Phát'} className="grid size-10 place-items-center rounded-full bg-canvas text-fg">
            {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button onClick={() => jump(10)} aria-label="Tới 10 giây" className="opacity-80 hover:opacity-100"><RotateCw size={18} /></button>
        </div>
        <div className="mt-2 flex items-center gap-2.5 text-[11.5px] num opacity-90">
          {fmt(pos)}
          <input type="range" min={0} max={duration} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="Vị trí phát" className="h-1 flex-1 accent-[var(--c-brand-400)]" />
          {fmt(duration)}
        </div>
      </div>
    </div>
  )
}

const TYPE_ICON = { text: Newspaper, album: Images, audio: Headphones }

/** Thẻ bài viết trong danh sách trên trang cá nhân */
export function PostCard({ post, username, locked }) {
  const Icon = TYPE_ICON[post.type] || Newspaper
  const text = post.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return (
    <Link to={`/${username}/bai-viet/${post.id}`} className="card group block overflow-hidden rounded-3xl transition-shadow hover:shadow-md">
      {post.images?.[0] && (
        <div className="relative">
          <FlowerArt seed={post.images[0]} className={cn('h-44 w-full', locked && 'blur-md scale-110')} />
          {locked && <span className="absolute inset-0 grid place-items-center"><span className="inline-flex items-center gap-1.5 rounded-full bg-fg/80 px-3 py-1.5 text-[12.5px] font-[550] text-canvas"><Lock size={13} /> {VISIBILITY_LABEL[post.visibility]}</span></span>}
        </div>
      )}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
          <Icon size={14} /> {timeAgo(post.at)}
          {post.pinned && <Badge tone="brand" icon={Pin} size="sm">Đã ghim</Badge>}
          {post.visibility !== 'public' && <Badge tone="gold" icon={Lock} size="sm">{VISIBILITY_LABEL[post.visibility]}</Badge>}
        </div>
        <h3 className="mt-2 text-[17px] font-[650] leading-snug tracking-tight group-hover:text-page">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[14px] text-muted">{locked ? 'Nội dung dành riêng. Ủng hộ để mở khoá bài này.' : text}</p>
        <div className="mt-3 flex items-center gap-4 text-[12.5px] text-muted">
          <span className="inline-flex items-center gap-1"><Heart size={14} /> {post.likes}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle size={14} /> {post.comments?.length || 0}</span>
        </div>
      </div>
    </Link>
  )
}
