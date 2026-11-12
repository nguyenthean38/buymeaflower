import { useEffect, useState } from 'react'
import { Plus, Trash2, Shuffle, ImageOff, Link as LinkIcon } from 'lucide-react'
import { Modal, Button, Input, Textarea, Toggle, Avatar, Field, Popover } from '@/components/ui'
import { FlowerArt } from '@/components/brand/Flower'
import { cn } from '@/lib/cn'
import { ITEM_OPTIONS, EMOJI_CHOICES, THEME_COLORS, AVATAR_COLORS, CATEGORIES } from '@/data/reference'
import { useApp, toast } from '@/store'

const isDark = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 150
}

/** Hộp thoại "Sửa trang": hồ sơ, giới thiệu, liên kết, món thay cho bông hoa, màu chủ đề, ảnh bìa. */
export function EditPageModal({ open, onClose }) {
  const page = useApp((s) => s.page)
  const mutate = useApp((s) => s.mutate)
  const [f, setF] = useState(page)
  const [err, setErr] = useState({})
  useEffect(() => { if (open) { setF(structuredClone(page)); setErr({}) } }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const set = (patch) => setF((x) => ({ ...x, ...patch }))

  const save = () => {
    const e = {}
    if (!f.name.trim()) e.name = 'Nhập tên hiển thị'
    if (!f.item.name.trim()) e.item = 'Nhập tên món'
    if (!isDark(f.themeColor)) e.color = 'Màu này hơi nhạt, chữ trắng sẽ khó đọc. Hãy chọn màu đậm hơn.'
    setErr(e)
    if (Object.keys(e).length) return
    mutate((d) => { d.page = { ...f, name: f.name.trim(), socials: f.socials.map((s) => s.trim()).filter(Boolean) } })
    toast('Đã lưu trang của bạn')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Sửa trang" size="lg"
      footer={<><Button onClick={onClose}>Huỷ</Button><Button variant="primary" onClick={save}>Lưu</Button></>}>
      <div className="space-y-5">
        <Field label="Ảnh đại diện" hint="Tài khoản demo có ảnh sẵn. Trang mới dùng chữ cái đầu của tên trên nền màu bạn chọn.">
          <div className="flex items-center gap-4">
            <Avatar name={f.name} color={f.avatarColor} size={64} />
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <button key={c} onClick={() => set({ avatarColor: c })} aria-label={`Màu ${c}`} aria-pressed={f.avatarColor === c}
                  className={cn('size-7 rounded-full ring-offset-2 ring-offset-surface transition-shadow', f.avatarColor === c && 'ring-2 ring-fg')} style={{ background: c }} />
              ))}
            </div>
          </div>
        </Field>

        <Input label="Tên hiển thị" value={f.name} onChange={(e) => set({ name: e.target.value })} error={err.name} maxLength={40} />
        <Input label="Bạn đang làm gì?" value={f.tagline} onChange={(e) => set({ tagline: e.target.value })} placeholder="đang vẽ tranh, đang làm podcast, đang viết tiểu thuyết…" maxLength={80}
          hint={f.tagline ? `Hiển thị: “${f.name} ${f.tagline}”` : 'Một câu ngắn, bắt đầu bằng “đang …”'} />
        <Field label="Lĩnh vực">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => set({ category: c })} className={cn('rounded-full border px-3 py-1 text-[13px] transition-colors', f.category === c ? 'border-brand-400 bg-brand-50 text-brand-ink font-[550]' : 'border-line text-dim hover:bg-subtle')}>{c}</button>
            ))}
          </div>
        </Field>
        <Textarea label="Giới thiệu" rows={5} value={f.about} onChange={(e) => set({ about: e.target.value })} placeholder="Kể về bạn, công việc bạn làm và khoản ủng hộ sẽ giúp gì cho bạn." />
        <Input label="Video nổi bật" optional value={f.video} onChange={(e) => set({ video: e.target.value })} placeholder="Dán đường dẫn video của bạn" prefix={LinkIcon} />

        <Field label="Liên kết mạng xã hội">
          <div className="space-y-2">
            {f.socials.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input className="flex-1" value={s} prefix={LinkIcon} placeholder="https://" onChange={(e) => set({ socials: f.socials.map((x, j) => (j === i ? e.target.value : x)) })} />
                <Button variant="ghost" icon={Trash2} aria-label="Xoá liên kết" onClick={() => set({ socials: f.socials.filter((_, j) => j !== i) })} />
              </div>
            ))}
            {f.socials.length < 5 && <Button size="sm" icon={Plus} onClick={() => set({ socials: [...f.socials, ''] })}>Thêm liên kết</Button>}
          </div>
        </Field>

        <Field label="Thay “bông hoa” bằng món bạn thích" error={err.item}>
          <div className="flex gap-2">
            <Popover width={248} trigger={(p) => <button {...p} className="grid h-10 w-12 shrink-0 place-items-center rounded-[10px] border border-line-strong bg-surface text-[20px] hover:bg-subtle" aria-label="Chọn biểu tượng">{f.item.emoji}</button>}>
              {(close) => (
                <div className="grid grid-cols-5 gap-1 p-1">
                  {EMOJI_CHOICES.map((e) => <button key={e} onClick={() => { set({ item: { ...f.item, emoji: e } }); close() }} className="grid size-10 place-items-center rounded-lg text-[20px] hover:bg-hover">{e}</button>)}
                </div>
              )}
            </Popover>
            <Input className="flex-1" value={f.item.name} onChange={(e) => set({ item: { ...f.item, name: e.target.value } })} maxLength={24} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ITEM_OPTIONS.map((o) => (
              <button key={o.name} onClick={() => set({ item: o })} className={cn('rounded-full border px-2.5 py-1 text-[12.5px] transition-colors', f.item.name === o.name ? 'border-brand-400 bg-brand-50 text-brand-ink' : 'border-line text-dim hover:bg-subtle')}>{o.emoji} {o.name}</button>
            ))}
          </div>
        </Field>

        <Field label="Màu chủ đề" error={err.color}>
          <div className="flex flex-wrap items-center gap-2">
            {THEME_COLORS.map((c) => (
              <button key={c.value} onClick={() => set({ themeColor: c.value })} title={c.name} aria-pressed={f.themeColor === c.value}
                className={cn('flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[13px] transition-colors', f.themeColor === c.value ? 'border-fg bg-subtle font-[550]' : 'border-line hover:bg-subtle')}>
                <span className="size-5 rounded-full" style={{ background: c.value }} />{c.name}
              </button>
            ))}
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-[13px] hover:bg-subtle">
              <input type="color" value={f.themeColor} onChange={(e) => set({ themeColor: e.target.value })} className="size-5 cursor-pointer rounded-full border-0 bg-transparent p-0" />Màu khác
            </label>
          </div>
        </Field>

        <Field label="Ảnh bìa" hint="Bản demo lấy ảnh từ kho ảnh mẫu thay cho ảnh tải lên.">
          {f.cover ? <FlowerArt seed={f.cover.seed} variant={f.cover.variant} className="h-28 w-full rounded-2xl" /> : <div className="grid h-28 place-items-center rounded-2xl border border-dashed border-line-strong text-[13px] text-muted">Chưa có ảnh bìa</div>}
          <div className="mt-2 flex gap-2">
            <Button size="sm" icon={Shuffle} onClick={() => set({ cover: { seed: Math.floor(Math.random() * 900) + 1 } })}>{f.cover ? 'Đổi ảnh khác' : 'Thêm ảnh bìa'}</Button>
            {f.cover && <Button size="sm" variant="ghost" icon={ImageOff} onClick={() => set({ cover: null })}>Gỡ ảnh bìa</Button>}
          </div>
        </Field>

        <Toggle checked={f.showCount} onChange={(v) => set({ showCount: v })} label="Hiện số người ủng hộ" desc="Con số công khai giúp trang đáng tin hơn và khích lệ người mới." />
      </div>
    </Modal>
  )
}
