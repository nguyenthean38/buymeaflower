import { useState } from 'react'
import { Check, Gift, Pencil, Plus, Trash2 } from 'lucide-react'
import { DashPage } from '@/components/layout/DashPage'
import { Badge, Button, Callout, Confirm, Input, Modal, MoneyInput, Progress, Textarea } from '@/components/ui'
import { Flower, FlowerArt } from '@/components/brand/Flower'
import { useApp, toast, uid } from '@/store'
import { formatVND } from '@/lib/format'
import { ArtPicker, RowMenu, randomArt } from '@/features/kiemtien/shared'

const blank = () => ({ id: null, name: '', price: 0, raised: 0, desc: '', art: randomArt() })

export default function WishlistPage() {
  const wishlist = useApp((s) => s.wishlist)
  const mutate = useApp((s) => s.mutate)
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [remove, setRemove] = useState(null)

  const open = (w) => { setForm(w ? { ...w } : blank()); setErrors({}) }
  const set = (patch) => { setForm((f) => ({ ...f, ...patch })); setErrors({}) }
  const done = wishlist.filter((w) => w.raised >= w.price).length
  const raised = wishlist.reduce((a, w) => a + w.raised, 0)

  const save = () => {
    const e = {}
    const name = form.name.trim()
    if (!name) e.name = 'Hãy đặt tên cho điều ước.'
    if (form.price < 10000) e.price = 'Giá mục tiêu tối thiểu là 10.000 ₫.'
    setErrors(e)
    if (Object.keys(e).length) return
    const rec = { id: form.id || uid('mu'), name, price: form.price, raised: form.raised || 0, desc: form.desc.trim(), art: form.art }
    mutate((d) => {
      const i = d.wishlist.findIndex((w) => w.id === rec.id)
      if (i >= 0) d.wishlist[i] = rec; else d.wishlist.unshift(rec)
    })
    toast(form.id ? 'Đã cập nhật điều ước' : 'Đã thêm điều ước mới')
    setForm(null)
  }
  const doRemove = () => {
    const w = remove
    mutate((d) => { d.wishlist = d.wishlist.filter((x) => x.id !== w.id) })
    toast(`Đã xoá “${w.name}”`)
  }

  return (
    <DashPage title="Điều ước" desc="Người hâm mộ có thể góp tiền để bạn mua món đồ cần cho công việc."
      actions={wishlist.length > 0 && <Button variant="primary" icon={Plus} onClick={() => open(null)}>Thêm điều ước</Button>}>
      {wishlist.length === 0 ? (
        <section className="card relative overflow-hidden px-6 py-14 text-center">
          <Flower kind="mai" size={56} className="absolute -left-4 -top-4 opacity-25" />
          <Flower kind="luuly" size={40} className="absolute right-8 top-8 opacity-25" />
          <Flower kind="sen" size={72} className="absolute -bottom-6 -right-5 opacity-20" />
          <Flower kind="cuc" size={34} className="absolute bottom-8 left-10 opacity-25" />
          <div className="relative">
            <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-brand-50 text-brand-ink"><Gift size={28} /></span>
            <h2 className="mt-5 text-[22px] font-[650] tracking-tight text-fg">Bạn đang mơ về món đồ nào?</h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-muted leading-relaxed">
              Một chiếc micro mới, hộp màu, hay bảng vẽ: hãy kể cho người hâm mộ biết món đồ sẽ giúp công việc của bạn thế nào. Họ có thể góp từng chút cho đến khi đủ.
            </p>
            <Button variant="primary" size="lg" icon={Plus} className="mt-6" onClick={() => open(null)}>Thêm điều ước đầu tiên</Button>
          </div>
        </section>
      ) : (
        <>
          <Callout tone="brand" icon={Gift}>
            Mọi người đã góp <b className="num">{formatVND(raised)}</b> cho {wishlist.length} điều ước của bạn{done > 0 ? `, trong đó ${done} điều ước đã đủ` : ''}.
          </Callout>
          <div className="grid gap-4 sm:grid-cols-2">
            {wishlist.map((w) => {
              const full = w.raised >= w.price
              const pct = Math.min(100, Math.round((w.raised / (w.price || 1)) * 100))
              return (
                <article key={w.id} className="card flex flex-col overflow-hidden">
                  <div className="relative">
                    <FlowerArt seed={w.art} className="h-40 w-full" />
                    {full && <Badge tone="pos" icon={Check} className="absolute left-3 top-3 shadow-sm">Đã đủ</Badge>}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="ds-h2 min-w-0 break-words">{w.name}</h3>
                      <span className="-mr-2 -mt-1 shrink-0">
                        <RowMenu items={[
                          { label: 'Sửa', icon: Pencil, onClick: () => open(w) },
                          { divider: true },
                          { label: 'Xoá', icon: Trash2, danger: true, onClick: () => setRemove(w) },
                        ]} />
                      </span>
                    </div>
                    {w.desc && <p className="mt-1.5 text-[13.5px] text-dim leading-relaxed break-words">{w.desc}</p>}
                    <div className="mt-auto pt-4">
                      <Progress value={w.raised} max={w.price} auto={false} tone={full ? 'pos' : 'brand'} height={8} />
                      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 text-[13px]">
                        <span className="text-muted"><span className="num font-[600] text-fg">{formatVND(w.raised)}</span> / <span className="num">{formatVND(w.price)}</span></span>
                        <span className={full ? 'num font-[600] text-pos' : 'num font-[550] text-muted'}>{pct}%</span>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Sửa điều ước' : 'Thêm điều ước'}
        desc="Kể ngắn gọn món đồ này giúp gì cho công việc của bạn."
        footer={<>
          <Button variant="secondary" onClick={() => setForm(null)}>Huỷ</Button>
          <Button variant="primary" onClick={save}>{form?.id ? 'Lưu thay đổi' : 'Thêm điều ước'}</Button>
        </>}>
        {form && (
          <div className="flex flex-col gap-4">
            <Input label="Tên món đồ" value={form.name} maxLength={60} autoFocus error={errors.name} placeholder="Ví dụ: Micro thu âm"
              onChange={(e) => set({ name: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') save() }} />
            <MoneyInput label="Giá mục tiêu" value={form.price} error={errors.price} onChange={(v) => set({ price: v })}
              hint={form.raised > 0 ? `Đã góp được ${formatVND(form.raised)}` : undefined} />
            <Textarea label="Mô tả" optional rows={3} maxLength={200} value={form.desc} onChange={(e) => set({ desc: e.target.value })}
              placeholder="Vì sao bạn cần món đồ này?" hint={`${form.desc.length}/200`} />
            <ArtPicker label="Ảnh" value={form.art} onChange={(art) => set({ art })} height="h-32" />
          </div>
        )}
      </Modal>
      <Confirm open={!!remove} onClose={() => setRemove(null)} onConfirm={doRemove} danger confirmLabel="Xoá điều ước"
        title={remove ? `Xoá “${remove.name}”?` : ''}
        desc={remove?.raised > 0 ? `Điều ước này đã được góp ${formatVND(remove.raised)}. Số tiền vẫn nằm trong số dư của bạn.` : 'Điều ước sẽ biến mất khỏi trang của bạn.'} />
    </DashPage>
  )
}
