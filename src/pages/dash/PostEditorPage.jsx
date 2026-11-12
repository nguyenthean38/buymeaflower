import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, Check, ChevronDown, Copy, Eye, FileQuestion, FileText, ImagePlus, Plus, RefreshCw, Send, X } from 'lucide-react'
import { DashPage } from '@/components/layout/DashPage'
import { Badge, Button, Checkbox, EmptyState, Input, Menu, Modal, Popover, Select, Textarea } from '@/components/ui'
import { FlowerArt } from '@/components/brand/Flower'
import { useApp, toast, uid, nowISO } from '@/store'
import { DOMAIN, VISIBILITY } from '@/data/reference'
import { addDays, formatDateTime } from '@/lib/format'
import { cn } from '@/lib/cn'
import { RichEditor } from '@/features/dangtai/RichEditor'
import { AudioStudio } from '@/features/dangtai/AudioStudio'
import { copyText, demoNow, htmlToText, POST_TYPES, randomArt, textToHtml } from '@/features/dangtai/shared'

const LIST = '/quan-ly/bai-viet'
const pad = (n) => String(n).padStart(2, '0')
const localDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const localTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
const STATUS_OF = { publish: 'published', schedule: 'scheduled', draft: 'draft' }
const MODE_OF = { published: 'publish', scheduled: 'schedule', draft: 'draft' }

const panelLabel = 'text-[13px] font-[600] text-fg'
const nativeControl = 'h-10 w-full min-w-0 rounded-[10px] border border-line-strong bg-surface px-3 text-[14px] text-fg outline-none transition-[border,box-shadow] hover:border-faint focus:border-brand-400 focus:ring-[3px] focus:ring-brand-100 dark:[color-scheme:dark]'

/** Ô tiêu đề lớn không viền, tự giãn theo số dòng */
function TitleInput({ value, onChange, error, placeholder }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])
  return (
    <div>
      <textarea ref={ref} rows={1} value={value} maxLength={140} placeholder={placeholder} aria-label="Tiêu đề" aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value.replace(/\n/g, ' '))}
        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
        className="block w-full resize-none overflow-hidden bg-transparent text-[24px] font-[700] leading-tight tracking-tight text-fg outline-none placeholder:text-faint sm:text-[28px]" />
      {error && <p className="mt-1.5 text-[12.5px] text-neg">{error}</p>}
    </div>
  )
}

/** Dải ảnh thu nhỏ có nút xoá */
function ImageStrip({ images, onRemove, coverLabel }) {
  if (!images.length) return null
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {images.map((seed, i) => (
        <div key={`${seed}-${i}`} className="group relative overflow-hidden rounded-xl">
          <FlowerArt seed={seed} className="aspect-[4/3] w-full" />
          {coverLabel && i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-[550] text-white">{coverLabel}</span>}
          <button type="button" onClick={() => onRemove(i)} aria-label={`Xoá ảnh ${i + 1}`}
            className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75">
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  )
}

function Editor({ post, type }) {
  const navigate = useNavigate()
  const mutate = useApp((s) => s.mutate)
  const username = useApp((s) => s.page.username)
  const allCategories = useApp((s) => s.categories)
  const wasPublished = post?.status === 'published'

  const htmlRef = useRef(post?.html || '')
  const [title, setTitle] = useState(post?.title || '')
  const [caption, setCaption] = useState(() => (type === 'text' ? '' : htmlToText(post?.html || '')))
  const [images, setImages] = useState(() => (post?.images?.length ? post.images : type === 'audio' ? [randomArt()] : []))
  const [duration, setDuration] = useState(post?.audio?.duration || null)
  const [visibility, setVisibility] = useState(post?.visibility || 'public')
  const [cats, setCats] = useState(post?.categories || [])
  const [mode, setMode] = useState(MODE_OF[post?.status] || 'publish')
  const [when, setWhen] = useState(() => {
    if (post?.scheduledAt) { const d = new Date(post.scheduledAt); return { date: localDate(d), time: localTime(d) } }
    return { date: localDate(addDays(new Date(demoNow()), 1)), time: '09:00' }
  })
  const [errors, setErrors] = useState({})
  const [adding, setAdding] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [catError, setCatError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [done, setDone] = useState(null)
  const [copied, setCopied] = useState(false)

  const clearError = (k) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e))
  const addImages = (n = 1) => { setImages((a) => [...a, ...Array.from({ length: n }, randomArt)]); clearError('images') }
  const removeImage = (i) => setImages((a) => a.filter((_, j) => j !== i))
  const toggleCat = (c) => setCats((a) => (a.includes(c) ? a.filter((x) => x !== c) : [...a, c]))
  const categoryList = [...allCategories, ...cats.filter((c) => !allCategories.includes(c))]

  const addCategory = () => {
    const name = newCat.trim().replace(/\s+/g, ' ')
    if (!name) { setCatError('Nhập tên chuyên mục'); return }
    const existed = categoryList.find((c) => c.toLowerCase() === name.toLowerCase())
    const final = existed || name
    if (!allCategories.includes(final)) mutate((d) => { if (!d.categories.includes(final)) d.categories.push(final) })
    setCats((a) => (a.includes(final) ? a : [...a, final]))
    setNewCat(''); setCatError(''); setAdding(false)
  }

  const save = () => {
    const errs = {}
    const t = title.trim()
    if (!t) errs.title = 'Nhập tiêu đề cho bài viết'
    if (mode !== 'draft') {
      if (type === 'album' && !images.length) errs.images = 'Thêm ít nhất một ảnh vào album'
      if (type === 'audio' && !duration) errs.audio = 'Tải tệp âm thanh hoặc thu âm trước khi đăng'
    }
    let scheduledAt = null
    if (mode === 'schedule') {
      const d = new Date(`${when.date}T${when.time}`)
      if (!when.date || !when.time || Number.isNaN(d.getTime())) errs.schedule = 'Chọn đủ ngày và giờ đăng'
      else if (d.getTime() < demoNow() + 30 * 60000) errs.schedule = 'Giờ hẹn phải ở tương lai, cách hiện tại ít nhất 30 phút'
      else scheduledAt = d.toISOString()
    }
    setErrors(errs)
    const first = Object.values(errs)[0]
    if (first) { toast({ title: 'Chưa thể lưu bài', desc: first, tone: 'neg' }); return }

    const status = STATUS_OF[mode]
    const id = post?.id || uid('bv')
    const html = type === 'text' ? htmlRef.current : textToHtml(caption)
    mutate((d) => {
      let p = d.posts.find((x) => x.id === id)
      if (!p) {
        p = { id, likes: 0, liked: false, comments: [], pinned: false, at: nowISO() }
        d.posts.unshift(p)
      } else if (!(wasPublished && status === 'published')) p.at = nowISO()
      Object.assign(p, { type, title: t, html, images, visibility, categories: cats, status })
      if (type === 'audio' && duration) p.audio = { duration }; else delete p.audio
      if (scheduledAt) p.scheduledAt = scheduledAt; else delete p.scheduledAt
      if (status !== 'published') p.pinned = false
    })

    if (status === 'published' && !wasPublished) { setDone({ id }); return }
    toast(status === 'published' ? 'Đã cập nhật bài viết' : status === 'scheduled' ? { title: 'Đã hẹn giờ đăng bài', desc: `Bài sẽ lên trang lúc ${formatDateTime(scheduledAt)}` } : 'Đã lưu bản nháp')
    navigate(LIST)
  }

  const link = done ? `${DOMAIN}/${username}/bai-viet/${done.id}` : ''
  const copy = async () => {
    if (await copyText(`https://${link}`)) { setCopied(true); toast('Đã sao chép liên kết'); setTimeout(() => setCopied(false), 2000) }
    else toast({ title: 'Không sao chép được', desc: 'Bạn hãy chọn và sao chép liên kết bằng tay nhé.', tone: 'neg' })
  }

  const MODES = [
    { value: 'publish', label: wasPublished ? 'Cập nhật bài đã đăng' : 'Đăng ngay', short: wasPublished ? 'Cập nhật bài' : 'Đăng ngay', desc: wasPublished ? 'Lưu thay đổi lên trang' : 'Bài lên trang ngay lập tức', icon: Send },
    { value: 'schedule', label: 'Hẹn giờ', short: 'Hẹn giờ đăng', desc: 'Tự đăng vào lúc bạn chọn', icon: CalendarClock },
    { value: 'draft', label: 'Lưu nháp', short: 'Lưu nháp', desc: wasPublished ? 'Gỡ khỏi trang, viết tiếp sau' : 'Chỉ mình bạn thấy', icon: FileText },
  ]
  const current = MODES.find((m) => m.value === mode)
  const typeInfo = POST_TYPES[type]
  const cover = images[0]

  return (
    <DashPage className="max-w-none">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" icon={ArrowLeft} to={LIST} className="-ml-2">Bài viết</Button>
        <div className="flex items-center gap-2">
          <Badge icon={typeInfo.icon}>{typeInfo.label}</Badge>
          {post && <Badge tone={wasPublished ? 'pos' : post.status === 'scheduled' ? 'info' : 'neutral'} dot>{wasPublished ? 'Đã đăng' : post.status === 'scheduled' ? 'Đã hẹn giờ' : 'Bản nháp'}</Badge>}
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_288px]">
        {/* Nội dung */}
        <div className="card flex min-w-0 flex-col gap-5 p-5 sm:p-7">
          <TitleInput value={title} onChange={(v) => { setTitle(v); clearError('title') }} error={errors.title}
            placeholder={type === 'album' ? 'Tên album' : type === 'audio' ? 'Tiêu đề bài âm thanh' : 'Tiêu đề bài viết'} />

          {type === 'text' && (
            <>
              <RichEditor initialHtml={post?.html || ''} onChange={(h) => { htmlRef.current = h }} onAddImage={() => { addImages(1); toast('Đã thêm ảnh minh hoạ vào cuối bài') }}
                placeholder="Kể câu chuyện của bạn…" />
              {images.length > 0 && (
                <div className="border-t border-line pt-5">
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <span className={panelLabel}>Ảnh minh hoạ ({images.length})</span>
                    <span className="ds-caption">Hiển thị bên dưới nội dung · ảnh lấy từ kho ảnh mẫu</span>
                  </div>
                  <ImageStrip images={images} onRemove={removeImage} />
                </div>
              )}
            </>
          )}

          {type === 'album' && (
            <>
              <div>
                <button type="button" onClick={() => addImages(1)}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); addImages(Math.min(12, e.dataTransfer.files?.length || 1)) }}
                  className={cn('flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-9 text-center transition-colors',
                    dragOver ? 'border-brand-400 bg-brand-50' : errors.images ? 'border-neg hover:bg-subtle' : 'border-line-strong hover:bg-subtle')}>
                  <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-ink"><ImagePlus size={20} /></span>
                  <span className="text-[14px] font-[600] text-fg">{images.length ? 'Thêm ảnh' : 'Kéo thả ảnh vào đây hoặc bấm để thêm ảnh'}</span>
                  <span className="ds-caption">Mỗi lần bấm thêm một ảnh từ kho ảnh mẫu của bản demo</span>
                </button>
                {errors.images && <p className="mt-1.5 text-[12.5px] text-neg">{errors.images}</p>}
              </div>
              <ImageStrip images={images} onRemove={removeImage} coverLabel="Ảnh bìa" />
              <Textarea label="Chú thích" optional rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Đôi dòng về bộ ảnh này…" />
            </>
          )}

          {type === 'audio' && (
            <>
              <AudioStudio value={duration} onChange={(d) => { setDuration(d); clearError('audio') }} error={errors.audio} />
              <Textarea label="Mô tả" optional rows={5} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Bài này nói về điều gì? Ghi chú, mốc thời gian…" />
            </>
          )}
        </div>

        {/* Bảng tuỳ chọn */}
        <aside className="card flex flex-col gap-5 p-5">
          <div>
            <div className="flex">
              <Button variant="primary" size="lg" icon={current.icon} onClick={save} className="min-w-0 flex-1 rounded-r-none px-4">{current.short}</Button>
              <Popover align="end" width={264} trigger={(p) => (
                <Button {...p} variant="primary" size="lg" aria-label="Chọn cách đăng" className="rounded-l-none border-l border-white/25 px-3"><ChevronDown size={18} /></Button>
              )}>
                {(close) => <Menu onClose={close} items={MODES.map((m) => ({ label: m.label, desc: m.desc, icon: m.icon, checked: m.value === mode, onClick: () => { setMode(m.value); clearError('schedule') } }))} />}
              </Popover>
            </div>

            {mode === 'schedule' && (
              <div className="mt-3 animate-fade-in">
                <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                  <input type="date" aria-label="Ngày đăng" value={when.date} min={localDate(new Date(demoNow()))} aria-invalid={!!errors.schedule}
                    onChange={(e) => { setWhen((w) => ({ ...w, date: e.target.value })); clearError('schedule') }} className={cn(nativeControl, errors.schedule && 'border-neg')} />
                  <input type="time" aria-label="Giờ đăng" value={when.time} aria-invalid={!!errors.schedule}
                    onChange={(e) => { setWhen((w) => ({ ...w, time: e.target.value })); clearError('schedule') }} className={cn(nativeControl, errors.schedule && 'border-neg')} />
                </div>
                {errors.schedule
                  ? <p className="mt-1.5 text-[12.5px] text-neg">{errors.schedule}</p>
                  : <p className="ds-caption mt-1.5">Bài sẽ tự lên trang vào đúng giờ này.</p>}
              </div>
            )}
            {mode === 'draft' && <p className="ds-caption mt-2">Bản nháp chỉ mình bạn thấy, có thể đăng bất cứ lúc nào.</p>}
          </div>

          <Select label="Ai xem được bài này?" value={visibility} onChange={(e) => setVisibility(e.target.value)} options={VISIBILITY}
            hint={VISIBILITY.find((v) => v.value === visibility)?.desc} />

          <div>
            <div className={panelLabel}>Chuyên mục</div>
            <div className="mt-2.5 flex flex-col gap-2.5">
              {categoryList.map((c) => <Checkbox key={c} label={c} checked={cats.includes(c)} onChange={() => toggleCat(c)} />)}
              {!categoryList.length && !adding && <p className="ds-caption">Chưa có chuyên mục nào. Tạo chuyên mục để người xem dễ tìm bài hơn.</p>}
            </div>
            {adding ? (
              <div className="mt-3">
                <div className="flex items-start gap-2">
                  <Input size="sm" autoFocus maxLength={30} value={newCat} placeholder="Tên chuyên mục" className="min-w-0 flex-1" aria-label="Tên chuyên mục mới"
                    onChange={(e) => { setNewCat(e.target.value); setCatError('') }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory() } if (e.key === 'Escape') { setAdding(false); setNewCat(''); setCatError('') } }} />
                  <Button size="sm" variant="primary" onClick={addCategory}>Thêm</Button>
                </div>
                {catError && <p className="mt-1.5 text-[12.5px] text-neg">{catError}</p>}
              </div>
            ) : (
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setAdding(true)} className="-ml-2 mt-2">Chuyên mục mới</Button>
            )}
          </div>

          {type !== 'text' && (
            <div>
              <div className={panelLabel}>Ảnh thu nhỏ</div>
              {cover != null ? (
                <div className="mt-2.5 overflow-hidden rounded-xl">
                  <FlowerArt seed={cover} className="aspect-[4/3] w-full" />
                </div>
              ) : (
                <div className="mt-2.5 grid aspect-[4/3] place-items-center rounded-xl bg-subtle px-4 text-center ds-caption">Thêm ảnh vào album để có ảnh thu nhỏ</div>
              )}
              {type === 'audio' ? (
                <Button size="sm" icon={RefreshCw} onClick={() => setImages([randomArt()])} className="mt-2.5">Đổi ảnh</Button>
              ) : (
                <Button size="sm" icon={RefreshCw} disabled={images.length < 2} onClick={() => setImages((a) => [...a.slice(1), a[0]])} className="mt-2.5">Đổi ảnh</Button>
              )}
              <p className="ds-caption mt-2">{type === 'audio' ? 'Ảnh minh hoạ của bản demo.' : 'Ảnh thu nhỏ là ảnh đầu tiên của album.'}</p>
            </div>
          )}
        </aside>
      </div>

      <Modal open={!!done} onClose={() => navigate(LIST)} size="sm" title="Bài viết đã lên trang! 🌸" desc="Chia sẻ liên kết để mọi người cùng đọc nhé."
        footer={<>
          <Button onClick={() => navigate(LIST)}>Về danh sách</Button>
          <Button variant="primary" icon={Eye} onClick={() => navigate(`/${username}/bai-viet/${done.id}`)}>Xem bài</Button>
        </>}>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-subtle py-1.5 pl-3.5 pr-1.5">
          <span className="min-w-0 flex-1 truncate text-[13.5px] text-fg" title={link}>{link}</span>
          <Button size="sm" variant={copied ? 'secondary' : 'outline'} icon={copied ? Check : Copy} onClick={copy}>{copied ? 'Đã chép' : 'Sao chép'}</Button>
        </div>
      </Modal>
    </DashPage>
  )
}

export default function PostEditorPage() {
  const { postId } = useParams()
  const [params] = useSearchParams()
  const post = useApp((s) => (postId ? s.posts.find((p) => p.id === postId) : null))

  if (postId && !post) {
    return (
      <DashPage>
        <div className="card">
          <EmptyState icon={FileQuestion} title="Không tìm thấy bài viết" desc="Bài viết này có thể đã bị xoá." action={<Button variant="primary" icon={ArrowLeft} to={LIST}>Về danh sách bài viết</Button>} />
        </div>
      </DashPage>
    )
  }
  const loai = params.get('loai')
  const type = POST_TYPES[post?.type] ? post.type : !post && POST_TYPES[loai] ? loai : 'text'
  return <Editor key={postId || `moi-${type}`} post={post || null} type={type} />
}
