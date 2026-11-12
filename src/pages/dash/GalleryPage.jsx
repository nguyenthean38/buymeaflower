import { useState } from 'react'
import { Download, Heart, ImagePlus, Images, MoreHorizontal, Pencil, RefreshCw, Search, Trash2 } from 'lucide-react'
import { DashPage } from '@/components/layout/DashPage'
import { Badge, Button, Checkbox, Confirm, EmptyState, IconButton, Input, Menu, Modal, Popover, SearchInput, Select, Textarea } from '@/components/ui'
import { FlowerArt } from '@/components/brand/Flower'
import { useApp, toast, uid, nowISO } from '@/store'
import { VISIBILITY, VISIBILITY_LABEL } from '@/data/reference'
import { formatNumber, timeAgo } from '@/lib/format'
import { matches, randomArt, VISIBILITY_ICON } from '@/features/dangtai/shared'

const VIS_TONE = { public: 'neutral', supporters: 'brand', members: 'gold' }

function PhotoModal({ photo, onClose }) {
  const mutate = useApp((s) => s.mutate)
  const editing = !!photo.id
  const [form, setForm] = useState({ title: photo.title || '', desc: photo.desc || '', art: photo.art, visibility: photo.visibility || 'public', downloadable: !!photo.downloadable })
  const [error, setError] = useState('')
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const submit = (e) => {
    e?.preventDefault()
    const title = form.title.trim()
    if (!title) { setError('Đặt tiêu đề cho ảnh'); return }
    const data = { ...form, title, desc: form.desc.trim() }
    mutate((d) => {
      const cur = d.gallery.find((g) => g.id === photo.id)
      if (cur) Object.assign(cur, data)
      else d.gallery.unshift({ id: uid('anh'), ...data, at: nowISO(), likes: 0 })
    })
    toast(editing ? 'Đã lưu thay đổi' : { title: 'Đã đăng ảnh lên bộ ảnh 🌸', desc: title })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={editing ? 'Sửa ảnh' : 'Thêm ảnh'}
      footer={<>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="primary" onClick={submit}>{editing ? 'Lưu thay đổi' : 'Đăng'}</Button>
      </>}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <div className="relative overflow-hidden rounded-2xl">
            <FlowerArt seed={form.art} className="aspect-[16/10] w-full" />
            <Button size="sm" variant="inverse" icon={RefreshCw} onClick={() => set({ art: randomArt() })} className="absolute bottom-3 right-3">Chọn ảnh khác</Button>
          </div>
          <p className="ds-caption mt-1.5">Bản demo lấy ảnh từ kho ảnh mẫu: mỗi lần chọn sẽ ra một ảnh khác.</p>
        </div>
        <Checkbox checked={form.downloadable} onChange={(v) => set({ downloadable: v })} label="Cho tải bản gốc" desc="Người xem được ảnh có thể tải về tệp chất lượng đầy đủ." />
        <Input label="Tiêu đề" autoFocus maxLength={80} value={form.title} error={error} placeholder="Ví dụ: Chiều Hồ Gươm"
          onChange={(e) => { set({ title: e.target.value }); setError('') }} />
        <Textarea label="Mô tả" optional rows={3} maxLength={300} value={form.desc} onChange={(e) => set({ desc: e.target.value })} placeholder="Chất liệu, kích thước, câu chuyện phía sau…" />
        <Select label="Ai xem được ảnh này?" value={form.visibility} onChange={(e) => set({ visibility: e.target.value })} options={VISIBILITY}
          hint={VISIBILITY.find((v) => v.value === form.visibility)?.desc} />
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

function PhotoCard({ photo, onEdit, onDelete }) {
  const VisIcon = VISIBILITY_ICON[photo.visibility] || VISIBILITY_ICON.public
  return (
    <article className="card overflow-hidden">
      <button type="button" onClick={onEdit} className="relative block w-full" aria-label={`Sửa ảnh ${photo.title}`}>
        <FlowerArt seed={photo.art} className="aspect-[4/3] w-full" />
        {photo.downloadable && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-[550] text-white"><Download size={11} />Tải bản gốc</span>
        )}
      </button>
      <div className="p-3 sm:p-3.5">
        <div className="flex items-start gap-1">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-[620] text-fg" title={photo.title}>{photo.title}</div>
            <div className="ds-caption mt-0.5">{timeAgo(photo.at)}</div>
          </div>
          <Popover align="end" width={180} trigger={(p) => <IconButton {...p} icon={MoreHorizontal} label="Tuỳ chọn" size="xs" className="-mr-1.5 -mt-0.5 shrink-0" />}>
            {(close) => <Menu onClose={close} items={[
              { label: 'Sửa', icon: Pencil, onClick: onEdit },
              { label: 'Xoá', icon: Trash2, danger: true, onClick: onDelete },
            ]} />}
          </Popover>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <Badge size="sm" tone={VIS_TONE[photo.visibility] || 'neutral'} icon={VisIcon}>{VISIBILITY_LABEL[photo.visibility] || 'Công khai'}</Badge>
          <span className="num inline-flex items-center gap-1 text-[12.5px] text-muted" title="Lượt thích"><Heart size={13} />{formatNumber(photo.likes)}</span>
        </div>
      </div>
    </article>
  )
}

export default function GalleryPage() {
  const gallery = useApp((s) => s.gallery)
  const mutate = useApp((s) => s.mutate)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)

  const list = [...gallery].sort((a, b) => new Date(b.at) - new Date(a.at)).filter((g) => !q.trim() || matches(g.title, q) || matches(g.desc, q))
  const openNew = () => setEditing({ art: randomArt() })
  const remove = () => {
    const id = removing.id
    mutate((d) => { d.gallery = d.gallery.filter((g) => g.id !== id) })
    toast('Đã xoá ảnh')
  }

  return (
    <DashPage title="Bộ ảnh" desc="Nơi trưng bày tác phẩm của bạn. Mỗi ảnh có thể công khai hoặc dành riêng cho người ủng hộ, hội viên."
      actions={<Button variant="primary" icon={ImagePlus} onClick={openNew}>Thêm ảnh</Button>}>
      {gallery.length === 0 ? (
        <div className="card">
          <EmptyState icon={Images} title="Chưa có ảnh nào" desc="Đăng tác phẩm đầu tiên để trang của bạn thêm rực rỡ. Bạn có thể cho phép người xem tải bản gốc."
            action={<Button variant="primary" icon={ImagePlus} onClick={openNew}>Thêm ảnh đầu tiên</Button>} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <SearchInput value={q} onChange={setQ} placeholder="Tìm theo tiêu đề, mô tả" className="max-w-xs" />
            <span className="ds-caption shrink-0 num">{q.trim() ? `${list.length}/${gallery.length} ảnh` : `${gallery.length} ảnh`}</span>
          </div>
          {list.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {list.map((g) => <PhotoCard key={g.id} photo={g} onEdit={() => setEditing(g)} onDelete={() => setRemoving(g)} />)}
            </div>
          ) : (
            <div className="card">
              <EmptyState icon={Search} title="Không tìm thấy ảnh nào" desc={`Không có ảnh nào khớp với “${q.trim()}”.`} action={<Button onClick={() => setQ('')}>Xoá từ khoá</Button>} />
            </div>
          )}
        </>
      )}

      {editing && <PhotoModal key={editing.id || 'moi'} photo={editing} onClose={() => setEditing(null)} />}
      <Confirm open={!!removing} onClose={() => setRemoving(null)} onConfirm={remove} danger confirmLabel="Xoá ảnh"
        title="Xoá ảnh này?" desc={removing ? `“${removing.title}” sẽ bị gỡ khỏi bộ ảnh của bạn.` : ''} />
    </DashPage>
  )
}
