import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, Eye, FileText, Heart, Images, MessageCircle, Mic, MoreHorizontal, PenLine, Pencil, Pin, PinOff, Search, Send, Trash2, X } from 'lucide-react'
import { DashPage } from '@/components/layout/DashPage'
import { Badge, Button, Confirm, EmptyState, IconButton, Menu, Popover, SearchInput, Tabs } from '@/components/ui'
import { FlowerArt } from '@/components/brand/Flower'
import { useApp, toast, nowISO } from '@/store'
import { VISIBILITY_LABEL } from '@/data/reference'
import { formatDateTime, formatNumber, timeAgo } from '@/lib/format'
import { cn } from '@/lib/cn'
import { matches, POST_TYPES, VISIBILITY_ICON } from '@/features/dangtai/shared'

const CREATE = [
  { type: 'text', label: 'Viết bài', desc: 'Chữ, ảnh, liên kết', icon: PenLine, tone: 'bg-brand-50 text-brand-ink' },
  { type: 'album', label: 'Thêm album ảnh', desc: 'Nhiều ảnh một lần', icon: Images, tone: 'bg-ice-soft text-ice' },
  { type: 'audio', label: 'Bài âm thanh', desc: 'Tải tệp hoặc thu âm', icon: Mic, tone: 'bg-gold-soft text-gold' },
]

const EMPTY = {
  published: { icon: FileText, title: 'Đăng bài viết đầu tiên', desc: 'Kể chuyện hậu trường, chia sẻ tác phẩm mới hoặc gửi lời cảm ơn tới những người đã tặng hoa cho bạn.', cta: 'Viết bài' },
  draft: { icon: PenLine, title: 'Chưa có bản nháp nào', desc: 'Bài bạn lưu nháp sẽ nằm ở đây để viết tiếp bất cứ lúc nào.', cta: 'Viết bản nháp' },
  scheduled: { icon: CalendarClock, title: 'Chưa có bài hẹn giờ', desc: 'Soạn trước rồi hẹn giờ, bài sẽ tự lên trang đúng lúc bạn chọn.', cta: 'Soạn bài hẹn giờ' },
}

const timeLine = (p) =>
  p.status === 'published' ? `Đăng lúc ${formatDateTime(p.at)}`
    : p.status === 'scheduled' ? `Hẹn đăng ${formatDateTime(p.scheduledAt || p.at)}`
      : `Sửa lần cuối ${timeAgo(p.at).toLowerCase()}`

function PostCard({ post, username, onPin, onPublish, onDelete }) {
  const navigate = useNavigate()
  const type = POST_TYPES[post.type] || POST_TYPES.text
  const VisIcon = VISIBILITY_ICON[post.visibility] || VISIBILITY_ICON.public
  const editTo = `/quan-ly/bai-viet/${post.id}`
  const published = post.status === 'published'
  const items = [
    { label: published ? 'Xem bài' : 'Xem trước', icon: Eye, onClick: () => navigate(`/${username}/bai-viet/${post.id}`) },
    { label: 'Sửa', icon: Pencil, onClick: () => navigate(editTo) },
    published && { label: post.pinned ? 'Bỏ ghim' : 'Ghim lên đầu trang', icon: post.pinned ? PinOff : Pin, onClick: onPin },
    !published && { label: 'Đăng ngay', icon: Send, onClick: onPublish },
    { divider: true },
    { label: 'Xoá', icon: Trash2, danger: true, onClick: onDelete },
  ]
  return (
    <article className="card flex items-start gap-4 p-4 sm:p-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
          <span>{timeLine(post)}</span>
          {post.pinned && <Badge tone="brand" size="sm" icon={Pin}>Đã ghim</Badge>}
        </div>
        <Link to={editTo} className="mt-1.5 block text-[16px] font-[650] leading-snug text-fg hover:text-brand-ink break-words">
          {post.title || 'Bài chưa có tiêu đề'}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-muted">
          <span className="inline-flex items-center gap-1.5"><type.icon size={14} />{type.label}</span>
          <span className="inline-flex items-center gap-1.5"><VisIcon size={14} />{VISIBILITY_LABEL[post.visibility] || 'Công khai'}</span>
          {published && (
            <>
              <span className="inline-flex items-center gap-1.5 num" title="Lượt thích"><Heart size={14} />{formatNumber(post.likes)}</span>
              <span className="inline-flex items-center gap-1.5 num" title="Bình luận"><MessageCircle size={14} />{formatNumber(post.comments?.length)}</span>
            </>
          )}
        </div>
      </div>
      {post.images?.[0] != null && (
        <Link to={editTo} className="hidden shrink-0 overflow-hidden rounded-xl sm:block" tabIndex={-1} aria-hidden>
          <FlowerArt seed={post.images[0]} className="h-[72px] w-24" />
        </Link>
      )}
      <Popover align="end" width={220} trigger={(p) => <IconButton {...p} icon={MoreHorizontal} label="Tuỳ chọn" size="sm" className="-mr-1.5 -mt-1 shrink-0" />}>
        {(close) => <Menu items={items} onClose={close} />}
      </Popover>
    </article>
  )
}

export default function PostsPage() {
  const posts = useApp((s) => s.posts)
  const username = useApp((s) => s.page.username)
  const mutate = useApp((s) => s.mutate)
  const [tab, setTab] = useState('published')
  const [searching, setSearching] = useState(false)
  const [q, setQ] = useState('')
  const [removing, setRemoving] = useState(null)

  const groups = useMemo(() => {
    const by = { published: [], draft: [], scheduled: [] }
    for (const p of posts) (by[p.status] || by.draft).push(p)
    by.published.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.at) - new Date(a.at))
    by.draft.sort((a, b) => new Date(b.at) - new Date(a.at))
    by.scheduled.sort((a, b) => new Date(a.scheduledAt || a.at) - new Date(b.scheduledAt || b.at))
    return by
  }, [posts])

  const list = q.trim() ? groups[tab].filter((p) => matches(p.title, q)) : groups[tab]
  const empty = EMPTY[tab]

  const togglePin = (post) => {
    mutate((d) => { for (const p of d.posts) p.pinned = p.id === post.id ? !post.pinned : false })
    toast(post.pinned ? 'Đã bỏ ghim bài viết' : 'Đã ghim bài viết lên đầu trang')
  }
  const publishNow = (post) => {
    mutate((d) => {
      const p = d.posts.find((x) => x.id === post.id)
      if (!p) return
      p.status = 'published'; p.at = nowISO(); delete p.scheduledAt
    })
    setTab('published')
    toast({ title: 'Bài viết đã lên trang! 🌸', desc: post.title })
  }
  const remove = () => {
    const id = removing.id
    mutate((d) => { d.posts = d.posts.filter((p) => p.id !== id) })
    toast('Đã xoá bài viết')
  }
  const closeSearch = () => { setSearching(false); setQ('') }

  return (
    <DashPage title="Bài viết" desc="Chia sẻ với mọi người, hoặc dành riêng cho người ủng hộ và hội viên của bạn.">
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {CREATE.map((c) => (
          <Link key={c.type} to={`/quan-ly/bai-viet/moi?loai=${c.type}`}
            className="card group flex flex-col items-center gap-2.5 px-2 py-4 text-center transition-shadow hover:shadow-sm sm:flex-row sm:gap-3.5 sm:p-5 sm:text-left">
            <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-105', c.tone)}><c.icon size={20} /></span>
            <span className="min-w-0">
              <span className="block text-[13px] font-[620] leading-tight text-fg sm:text-[14.5px]">{c.label}</span>
              <span className="mt-0.5 hidden ds-caption sm:block">{c.desc}</span>
            </span>
          </Link>
        ))}
      </div>

      <div>
        <div className="relative">
          <Tabs value={tab} onChange={setTab} className="pr-11" options={[
            { value: 'published', label: 'Đã đăng', count: groups.published.length },
            { value: 'draft', label: 'Bản nháp', count: groups.draft.length },
            { value: 'scheduled', label: 'Đã hẹn giờ', count: groups.scheduled.length },
          ]} />
          <IconButton icon={searching ? X : Search} label={searching ? 'Đóng tìm kiếm' : 'Tìm bài viết'} size="sm"
            onClick={() => (searching ? closeSearch() : setSearching(true))} className="absolute right-0 top-1 bg-canvas" />
        </div>
        {searching && <SearchInput value={q} onChange={setQ} autoFocus placeholder="Tìm theo tiêu đề bài viết" className="mt-3 animate-fade-in" />}

        <div className="mt-4 flex flex-col gap-3">
          {list.map((p) => (
            <PostCard key={p.id} post={p} username={username} onPin={() => togglePin(p)} onPublish={() => publishNow(p)} onDelete={() => setRemoving(p)} />
          ))}
          {!list.length && (
            <div className="card">
              {q.trim() && groups[tab].length
                ? <EmptyState icon={Search} title="Không tìm thấy bài nào" desc={`Không có bài nào trong mục này khớp với “${q.trim()}”.`} action={<Button onClick={() => setQ('')}>Xoá từ khoá</Button>} />
                : <EmptyState icon={empty.icon} title={empty.title} desc={empty.desc} action={<Button variant="primary" icon={PenLine} to="/quan-ly/bai-viet/moi?loai=text">{empty.cta}</Button>} />}
            </div>
          )}
        </div>
      </div>

      <Confirm open={!!removing} onClose={() => setRemoving(null)} onConfirm={remove} danger confirmLabel="Xoá bài viết"
        title="Xoá bài viết này?" desc={removing ? `“${removing.title}” cùng lượt thích và bình luận sẽ bị xoá vĩnh viễn.` : ''} />
    </DashPage>
  )
}
