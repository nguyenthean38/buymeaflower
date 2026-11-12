import { useState } from 'react'
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, ListPlus, Pencil, Plus, Trash2, Users, X } from 'lucide-react'
import { Badge, Button, Checkbox, Confirm, DynIcon, FlowShell, IconButton, Input, Modal, MoneyInput, Textarea } from '@/components/ui'
import { FlowerArt } from '@/components/brand/Flower'
import { useApp, toast, uid } from '@/store'
import { REWARD_TEMPLATES } from '@/data/reference'
import { formatNumber, formatVND } from '@/lib/format'
import { cn } from '@/lib/cn'
import { ArtPicker, randomArt } from './shared'

/** Thẻ hạng hội viên: dùng cho lưới hạng và bản xem trước trong trình soạn */
export function LevelCard({ level, annual, memberCount = 0, badge, footer, className }) {
  const left = level.limit ? Math.max(0, level.limit - memberCount) : null
  return (
    <div className={cn('card overflow-hidden flex flex-col', className)}>
      <FlowerArt seed={level.art} className="w-full h-28" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="ds-h2 min-w-0 break-words">{level.name || 'Tên hạng'}</h3>
          {badge}
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="num text-[24px] font-[650] tracking-tight text-fg">{formatVND(level.price)}</span>
          <span className="text-[13px] text-muted">/ tháng</span>
        </div>
        {annual && level.yearly > 0 && (
          <div className="mt-0.5 text-[12.5px] text-muted">hoặc <span className="num font-[550] text-dim">{formatVND(level.yearly)}</span> / năm</div>
        )}
        {level.desc && <p className="mt-3 text-[13.5px] text-dim leading-relaxed break-words">{level.desc}</p>}
        {level.rewards.length > 0 && (
          <ul className="mt-3.5 flex flex-col gap-2">
            {level.rewards.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[13.5px] text-fg">
                <span className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full bg-brand-50 text-brand-ink"><Check size={12} strokeWidth={3} /></span>
                <span className="min-w-0 break-words">{r}</span>
              </li>
            ))}
          </ul>
        )}
        {left != null && (
          <div className="mt-3.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-[12px] font-[550] text-gold">
            <Users size={12} /> {left > 0 ? `Còn ${formatNumber(left)}/${formatNumber(level.limit)} suất` : 'Đã đủ số hội viên'}
          </div>
        )}
        {footer && <div className="mt-auto pt-5">{footer}</div>}
      </div>
    </div>
  )
}

const blank = () => ({
  id: null, name: '', price: 50000, yearly: 500000, art: randomArt(), desc: '',
  rewards: [REWARD_TEMPLATES[0].title, REWARD_TEMPLATES[1].title], limit: null,
  welcome: 'Cảm ơn bạn đã trở thành hội viên! 🌸', published: true,
})
const toDraft = (lv) => ({ ...lv, rewards: [...lv.rewards], limitOn: !!lv.limit, limitText: String(lv.limit || 50) })

/** Trình soạn hạng hội viên toàn màn hình. level = null để tạo mới. */
export function LevelEditor({ level, onClose, onCreated }) {
  const isNew = !level
  const mutate = useApp((s) => s.mutate)
  const annual = useApp((s) => s.membership.settings.annual)
  const levels = useApp((s) => s.membership.levels)
  const memberCount = useApp((s) => (level ? s.membership.members.filter((m) => m.levelId === level.id).length : 0))

  const [start, setStart] = useState(() => toDraft(level || blank()))
  const [f, setF] = useState(start)
  const [yearlyAuto, setYearlyAuto] = useState(isNew)
  const [errors, setErrors] = useState({})
  const [picker, setPicker] = useState(false)
  const [custom, setCustom] = useState('')
  const [edit, setEdit] = useState(null) // { index, text }
  const [askDelete, setAskDelete] = useState(false)
  const [askDiscard, setAskDiscard] = useState(false)

  const set = (patch) => { setF((x) => ({ ...x, ...patch })); setErrors({}) }
  const dirty = JSON.stringify(f) !== JSON.stringify(start)
  const tryClose = () => (dirty ? setAskDiscard(true) : onClose())
  const suggestYearly = f.price * 10

  const addReward = (text) => {
    const t = text.trim()
    if (!t) return false
    if (f.rewards.some((r) => r.toLowerCase() === t.toLowerCase())) { toast({ title: 'Quyền lợi này đã có trong danh sách', tone: 'info' }); return false }
    set({ rewards: [...f.rewards, t] })
    return true
  }
  const move = (i, dir) => {
    const next = [...f.rewards]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    set({ rewards: next })
  }
  const commitEdit = () => {
    if (!edit) return
    const t = edit.text.trim()
    if (t) set({ rewards: f.rewards.map((r, i) => (i === edit.index ? t : r)) })
    setEdit(null)
  }

  const save = () => {
    const e = {}
    const name = f.name.trim()
    const limit = parseInt(f.limitText, 10)
    if (!name) e.name = 'Hãy đặt tên cho hạng.'
    else if (levels.some((l) => l.id !== f.id && l.name.trim().toLowerCase() === name.toLowerCase())) e.name = 'Bạn đã có một hạng trùng tên.'
    if (f.price < 1000) e.price = 'Giá tháng tối thiểu là 1.000 ₫.'
    if (f.yearly > 0 && f.yearly < f.price) e.yearly = 'Giá năm cần lớn hơn giá một tháng.'
    if (f.rewards.length === 0) e.rewards = 'Thêm ít nhất một quyền lợi để người hâm mộ biết họ nhận được gì.'
    if (f.limitOn) {
      if (!Number.isInteger(limit) || limit < 1) e.limit = 'Nhập số hội viên tối đa (từ 1).'
      else if (limit < memberCount) e.limit = `Hạng này đang có ${memberCount} hội viên, giới hạn không thể thấp hơn.`
    }
    setErrors(e)
    if (Object.keys(e).length) { toast({ title: 'Chưa lưu được', desc: 'Vui lòng kiểm tra lại các ô được đánh dấu.', tone: 'neg' }); return }
    const rec = {
      id: f.id || uid('lv'), name, price: f.price, yearly: f.yearly || f.price * 10, desc: f.desc.trim(), rewards: f.rewards,
      limit: f.limitOn ? limit : null, welcome: f.welcome.trim(), published: f.published, art: f.art,
    }
    mutate((d) => {
      const i = d.membership.levels.findIndex((l) => l.id === rec.id)
      if (i >= 0) d.membership.levels[i] = rec; else d.membership.levels.push(rec)
    })
    if (isNew) onCreated?.(rec); else toast(`Đã cập nhật hạng “${name}”`)
    onClose()
  }

  const togglePublished = () => {
    const next = !f.published
    mutate((d) => { const l = d.membership.levels.find((x) => x.id === f.id); if (l) l.published = next })
    setF((x) => ({ ...x, published: next }))
    setStart((x) => ({ ...x, published: next }))
    toast(next ? 'Hạng đã được công bố lại' : { title: 'Đã ngừng công bố', desc: 'Hội viên hiện tại vẫn giữ nguyên quyền lợi; người mới không thể tham gia.' })
  }
  const requestDelete = () => {
    if (memberCount > 0) {
      toast({ title: 'Chưa thể xoá hạng này', desc: `Hạng còn ${memberCount} hội viên. Hãy ngừng công bố hoặc huỷ tư cách các hội viên trước.`, tone: 'neg' })
      return
    }
    setAskDelete(true)
  }
  const doDelete = () => {
    mutate((d) => {
      d.membership.levels = d.membership.levels.filter((l) => l.id !== f.id)
      delete d.membership.settings.paused[f.id]
    })
    toast(`Đã xoá hạng “${f.name}”`)
    onClose()
  }

  const preview = (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="ds-label mb-3 flex items-center gap-1.5"><Eye size={13} /> Xem trước thẻ hạng</div>
      <LevelCard level={{ ...f, limit: f.limitOn ? parseInt(f.limitText, 10) || 0 : null }} annual={annual} memberCount={memberCount}
        badge={!f.published && <Badge tone="warn">Chưa công bố</Badge>}
        footer={<span className="flex h-10 w-full items-center justify-center rounded-full bg-brand-500 text-[14px] font-[550] text-white">Tham gia</span>} />
      <p className="ds-caption mt-3 text-center">Thẻ cập nhật ngay khi bạn chỉnh sửa.</p>
    </div>
  )

  return (
    <>
      <FlowShell open onClose={tryClose} title={isNew ? 'Tạo hạng hội viên' : `Sửa hạng “${start.name}”`}
        aside={<div className="p-10">{preview}</div>}
        footer={<>
          <Button variant="ghost" onClick={tryClose}>Huỷ</Button>
          <Button variant="primary" size="lg" onClick={save}>{isNew ? 'Tạo hạng' : 'Cập nhật'}</Button>
        </>}>
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="ds-h1">{isNew ? 'Hạng hội viên mới' : 'Chỉnh sửa hạng'}</h1>
            <p className="mt-1 text-[14px] text-muted">Mô tả rõ quyền lợi để người hâm mộ dễ quyết định đồng hành cùng bạn mỗi tháng.</p>
          </div>

          <Input label="Tên hạng" value={f.name} maxLength={40} autoFocus={isNew} error={errors.name} placeholder="Ví dụ: Nụ, Hoa, Vườn…"
            onChange={(e) => set({ name: e.target.value })} />

          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyInput label="Giá mỗi tháng" value={f.price} error={errors.price}
              onChange={(v) => set(yearlyAuto ? { price: v, yearly: v * 10 } : { price: v })} />
            <div>
              <MoneyInput label="Giá mỗi năm" value={f.yearly} error={errors.yearly}
                onChange={(v) => { setYearlyAuto(false); set({ yearly: v }) }} />
              {!errors.yearly && (
                <p className="ds-caption mt-1.5">
                  Gợi ý: <span className="num">{formatVND(suggestYearly)}</span> (10 tháng, tặng 2 tháng).{' '}
                  {f.yearly !== suggestYearly && <button type="button" className="font-[550] text-brand-ink hover:underline" onClick={() => set({ yearly: suggestYearly })}>Dùng mức này</button>}
                </p>
              )}
            </div>
          </div>
          {!annual && <p className="ds-caption -mt-2">Thanh toán theo năm đang tắt trong phần Cài đặt nên giá năm chưa hiển thị với người hâm mộ.</p>}

          <ArtPicker label="Ảnh bìa" value={f.art} onChange={(art) => set({ art })} height="h-36" />

          <Textarea label="Mô tả" optional rows={3} maxLength={240} value={f.desc} onChange={(e) => set({ desc: e.target.value })}
            placeholder="Hạng này dành cho ai, họ sẽ nhận được điều gì?" hint={`${f.desc.length}/240`} />

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[13px] font-[550] text-dim">Quyền lợi</div>
              <Button size="xs" variant="outline" icon={ListPlus} onClick={() => setPicker(true)}>Thêm từ gợi ý</Button>
            </div>
            {f.rewards.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line-strong px-4 py-5 text-center text-[13.5px] text-muted">Chưa có quyền lợi nào. Thêm từ gợi ý hoặc tự nhập bên dưới.</div>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {f.rewards.map((r, i) => (
                  <li key={i} className="flex items-center gap-1 rounded-xl bg-subtle py-1.5 pl-3 pr-1.5">
                    {edit?.index === i ? (
                      <>
                        <input autoFocus value={edit.text} maxLength={80} onChange={(e) => setEdit({ index: i, text: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') { e.stopPropagation(); setEdit(null) } }}
                          className="h-8 min-w-0 flex-1 rounded-lg border border-brand-400 bg-surface px-2.5 text-[13.5px] outline-none" />
                        <IconButton icon={Check} label="Lưu" size="sm" onClick={commitEdit} />
                        <IconButton icon={X} label="Bỏ" size="sm" onClick={() => setEdit(null)} />
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 break-words py-1 text-[13.5px] text-fg">{r}</span>
                        <IconButton icon={ArrowUp} label="Chuyển lên" size="xs" disabled={i === 0} onClick={() => move(i, -1)} />
                        <IconButton icon={ArrowDown} label="Chuyển xuống" size="xs" disabled={i === f.rewards.length - 1} onClick={() => move(i, 1)} />
                        <IconButton icon={Pencil} label="Sửa" size="xs" onClick={() => setEdit({ index: i, text: r })} />
                        <IconButton icon={Trash2} label="Xoá" size="xs" onClick={() => set({ rewards: f.rewards.filter((_, j) => j !== i) })} />
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2">
              <Input className="flex-1" value={custom} maxLength={80} placeholder="Tự nhập quyền lợi riêng của bạn"
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && addReward(custom)) setCustom('') }} />
              <Button icon={Plus} disabled={!custom.trim()} onClick={() => { if (addReward(custom)) setCustom('') }}>Thêm</Button>
            </div>
            {errors.rewards && <p className="text-[12.5px] text-neg">{errors.rewards}</p>}
          </div>

          <div className="rounded-xl border border-line p-4">
            <Checkbox checked={f.limitOn} onChange={(v) => set({ limitOn: v })} label="Giới hạn số hội viên"
              desc="Phù hợp với quyền lợi tốn công như thiệp vẽ tay hay buổi trò chuyện riêng." />
            {f.limitOn && (
              <Input className="mt-3 max-w-[200px]" inputMode="numeric" inputClassName="num" suffix="hội viên" value={f.limitText} error={errors.limit}
                onChange={(e) => set({ limitText: e.target.value.replace(/\D/g, '').slice(0, 5) })} />
            )}
          </div>

          <Textarea label="Lời chào mừng" optional rows={3} maxLength={300} value={f.welcome} onChange={(e) => set({ welcome: e.target.value })}
            hint="Gửi tự động qua tin nhắn ngay khi có hội viên mới tham gia hạng này." />

          {!isNew && (
            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
              <Button variant="outline" icon={f.published ? EyeOff : Eye} onClick={togglePublished}>{f.published ? 'Ngừng công bố' : 'Công bố lại'}</Button>
              <Button variant="danger-soft" icon={Trash2} onClick={requestDelete}>Xoá hạng</Button>
            </div>
          )}

          <div className="xl:hidden border-t border-line pt-6">{preview}</div>
        </div>
      </FlowShell>

      <Modal open={picker} onClose={() => setPicker(false)} title="Chọn quyền lợi gợi ý" desc="Bấm để thêm vào hạng; bạn có thể sửa lại câu chữ sau."
        footer={<Button variant="primary" onClick={() => setPicker(false)}>Xong</Button>}>
        <div className="flex flex-col gap-1.5">
          {REWARD_TEMPLATES.map((t) => {
            const added = f.rewards.some((r) => r.toLowerCase() === t.title.toLowerCase())
            return (
              <button key={t.id} type="button"
                onClick={() => set({ rewards: added ? f.rewards.filter((r) => r.toLowerCase() !== t.title.toLowerCase()) : [...f.rewards, t.title] })}
                className={cn('flex items-start gap-3 rounded-xl border p-3 text-left transition-colors', added ? 'border-brand-400 bg-brand-50' : 'border-line hover:bg-subtle')}>
                <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', added ? 'bg-brand-500 text-white' : 'bg-subtle text-dim')}><DynIcon name={t.icon} size={17} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-[550] text-fg">{t.title}</span>
                  <span className="block ds-caption mt-0.5">{t.desc}</span>
                </span>
                {added && <Check size={17} className="mt-1 shrink-0 text-brand-ink" />}
              </button>
            )
          })}
        </div>
      </Modal>

      <Confirm open={askDelete} onClose={() => setAskDelete(false)} onConfirm={doDelete} danger confirmLabel="Xoá hạng"
        title={`Xoá hạng “${f.name}”?`} desc="Hạng sẽ biến mất khỏi trang của bạn. Thao tác này không hoàn tác được." />
      <Confirm open={askDiscard} onClose={() => setAskDiscard(false)} onConfirm={onClose} danger confirmLabel="Bỏ thay đổi" cancelLabel="Tiếp tục sửa"
        title="Bỏ các thay đổi chưa lưu?" desc="Những gì bạn vừa chỉnh sẽ không được giữ lại." />
    </>
  )
}
