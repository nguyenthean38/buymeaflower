import { useState } from 'react'
import { Crown, Eye, Star } from 'lucide-react'
import { Badge, Button, Checkbox, Confirm, FlowShell, Input, MoneyInput, Textarea, Toggle } from '@/components/ui'
import { FlowerArt } from '@/components/brand/Flower'
import { useApp, toast, uid } from '@/store'
import { SHOP_KIND_LABEL } from '@/data/reference'
import { formatNumber, formatVND } from '@/lib/format'
import { cn } from '@/lib/cn'
import { ArtPicker, randomArt } from './shared'

/** "49.000 ₫" · "Từ 49.000 ₫" · "Tuỳ tâm" */
export function priceLabel(item) {
  if (item.payWhatYouWant) return item.price > 0 ? `Từ ${formatVND(item.price)}` : 'Tuỳ tâm'
  return formatVND(item.price)
}

/** Thẻ sản phẩm như người mua nhìn thấy */
export function ProductCard({ item, sold = 0, buyLabel = 'Mua ngay', className }) {
  const left = item.limit ? Math.max(0, item.limit - sold) : null
  return (
    <div className={cn('card overflow-hidden', className)}>
      <div className="relative">
        <FlowerArt seed={item.art} className="h-44 w-full" />
        <Badge className="absolute left-3 top-3 bg-surface/90 backdrop-blur">{SHOP_KIND_LABEL[item.kind] || SHOP_KIND_LABEL.scratch}</Badge>
      </div>
      <div className="p-5">
        <h3 className="ds-h2 break-words">{item.name || 'Tên sản phẩm'}</h3>
        {item.ratings && (
          <div className="mt-1.5 flex items-center gap-0.5 text-gold">
            {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />)}
            <span className="ml-1.5 text-[12px] text-muted">Chưa có đánh giá</span>
          </div>
        )}
        {item.desc && <p className="mt-2.5 text-[13.5px] text-dim leading-relaxed break-words whitespace-pre-line">{item.desc}</p>}
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="num text-[22px] font-[650] tracking-tight text-fg">{priceLabel(item)}</span>
          {left != null && <span className="text-[12.5px] font-[550] text-gold">{left > 0 ? `Còn ${formatNumber(left)} suất` : 'Đã hết suất'}</span>}
        </div>
        {item.memberPrice > 0 && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-[12.5px] text-brand-ink">
            <Crown size={13} /> Hội viên chỉ <span className="num font-[600]">{formatVND(item.memberPrice)}</span>
          </div>
        )}
        {item.question && (
          <div className="mt-4">
            <div className="text-[12.5px] font-[550] text-dim break-words">{item.question}</div>
            <div className="mt-1.5 h-9 rounded-[10px] border border-line-strong bg-surface" />
          </div>
        )}
        <span className="mt-4 flex h-10 w-full items-center justify-center rounded-full bg-brand-500 text-[14px] font-[550] text-white">{buyLabel}</span>
      </div>
    </div>
  )
}

const blank = (kind = 'scratch', preset = {}) => ({
  id: null, kind, name: '', price: 0, payWhatYouWant: false, desc: '', art: randomArt(), active: true,
  successMsg: 'Cảm ơn bạn đã ủng hộ! Thông tin chi tiết đã được gửi vào hộp thư của bạn.', question: '', limit: null, memberPrice: 0, ratings: true,
  ...preset,
})
const toDraft = (it) => ({
  ...it, questionOn: !!it.question, limitOn: !!it.limit, limitText: String(it.limit || 20),
  memberOn: it.memberPrice > 0, memberPrice: it.memberPrice || Math.round((it.price * 0.8) / 1000) * 1000,
})

/** Trình soạn sản phẩm toàn màn hình. item = null để tạo mới (kèm kind + preset từ mẫu). */
export function ProductEditor({ item, kind, preset, onClose, onCreated }) {
  const isNew = !item
  const mutate = useApp((s) => s.mutate)
  const word = useApp((s) => s.shop.word)
  const sold = useApp((s) => (item ? s.shop.claims.filter((c) => c.itemId === item.id && c.status !== 'refunded').length : 0))
  const [start] = useState(() => toDraft(item || blank(kind, preset)))
  const [f, setF] = useState(start)
  const [errors, setErrors] = useState({})
  const [askDiscard, setAskDiscard] = useState(false)

  const set = (patch) => { setF((x) => ({ ...x, ...patch })); setErrors({}) }
  const dirty = JSON.stringify(f) !== JSON.stringify(start)
  const tryClose = () => (dirty ? setAskDiscard(true) : onClose())
  const limit = parseInt(f.limitText, 10)

  const built = {
    id: f.id, kind: f.kind, name: f.name.trim(), price: f.price, payWhatYouWant: f.payWhatYouWant, desc: f.desc.trim(), art: f.art, active: f.active,
    successMsg: f.successMsg.trim(), question: f.questionOn ? f.question.trim() : '', limit: f.limitOn ? limit || 0 : null,
    memberPrice: f.memberOn ? f.memberPrice : 0, ratings: f.ratings,
  }

  const save = () => {
    const e = {}
    if (!built.name) e.name = 'Hãy đặt tên cho sản phẩm.'
    if (!f.payWhatYouWant && f.price < 1000) e.price = 'Giá tối thiểu là 1.000 ₫, hoặc cho người mua tự chọn mức giá.'
    if (f.payWhatYouWant && f.price > 0 && f.price < 1000) e.price = 'Mức tối thiểu là 0 ₫ (tuỳ tâm) hoặc từ 1.000 ₫.'
    if (!built.successMsg) e.successMsg = 'Hãy viết lời nhắn gửi người mua sau khi thanh toán.'
    if (f.questionOn && !built.question) e.question = 'Nhập câu hỏi bạn muốn hỏi người mua.'
    if (f.limitOn) {
      if (!Number.isInteger(limit) || limit < 1) e.limit = 'Nhập số lượng tối đa (từ 1).'
      else if (limit < sold) e.limit = `Sản phẩm đã bán ${sold} suất, giới hạn không thể thấp hơn.`
    }
    if (f.memberOn) {
      if (f.memberPrice < 1000) e.memberPrice = 'Giá hội viên tối thiểu là 1.000 ₫.'
      else if (f.price > 0 && f.memberPrice >= f.price) e.memberPrice = 'Giá hội viên cần thấp hơn giá thường.'
    }
    setErrors(e)
    if (Object.keys(e).length) { toast({ title: 'Chưa lưu được', desc: 'Vui lòng kiểm tra lại các ô được đánh dấu.', tone: 'neg' }); return }
    const rec = { ...built, id: built.id || uid('sp') }
    mutate((d) => {
      const i = d.shop.items.findIndex((x) => x.id === rec.id)
      if (i >= 0) d.shop.items[i] = rec; else d.shop.items.unshift(rec)
    })
    if (isNew) onCreated?.(rec); else toast(`Đã cập nhật “${rec.name}”`)
    onClose()
  }

  const preview = (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="ds-label mb-3 flex items-center gap-1.5"><Eye size={13} /> Xem trước thẻ sản phẩm</div>
      <ProductCard item={built} sold={sold} />
      <p className="ds-caption mt-3 text-center">Thẻ cập nhật ngay khi bạn chỉnh sửa.</p>
    </div>
  )

  return (
    <>
      <FlowShell open onClose={tryClose} title={isNew ? `Thêm vào ${word.toLowerCase()}` : `Sửa “${start.name}”`}
        aside={<div className="p-10">{preview}</div>}
        footer={<>
          <Button variant="ghost" onClick={tryClose}>Huỷ</Button>
          <Button variant="primary" size="lg" onClick={save}>{isNew ? 'Đăng bán' : 'Cập nhật'}</Button>
        </>}>
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="ds-h1">{isNew ? 'Sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h1>
              <Badge tone="brand">{SHOP_KIND_LABEL[f.kind] || SHOP_KIND_LABEL.scratch}</Badge>
            </div>
            <p className="mt-1 text-[14px] text-muted">Bán tệp tải về, vé sự kiện, lịch hẹn hay bất cứ thứ gì bạn làm ra.</p>
          </div>

          <Input label="Tên sản phẩm" value={f.name} maxLength={80} autoFocus={isNew && !f.name} error={errors.name}
            placeholder="Ví dụ: Bộ hình nền mùa thu" onChange={(e) => set({ name: e.target.value })} />

          <div>
            <MoneyInput className="max-w-[260px]" label={f.payWhatYouWant ? 'Giá tối thiểu' : 'Giá'} value={f.price} error={errors.price} onChange={(v) => set({ price: v })} />
            <Checkbox className="mt-3" checked={f.payWhatYouWant} onChange={(v) => set({ payWhatYouWant: v })}
              label="Cho người mua tự chọn mức giá (từ mức này trở lên)" desc="Để 0 ₫ nếu bạn muốn tặng miễn phí, ai thích thì ủng hộ tuỳ tâm." />
          </div>

          <ArtPicker label="Ảnh sản phẩm" value={f.art} onChange={(art) => set({ art })} />

          <Textarea label="Mô tả" optional rows={4} maxLength={500} value={f.desc} onChange={(e) => set({ desc: e.target.value })}
            placeholder="Người mua nhận được gì, khi nào, bằng cách nào?" hint={`${f.desc.length}/500`} />

          <Textarea label="Lời nhắn sau khi mua" rows={3} maxLength={300} value={f.successMsg} error={errors.successMsg}
            onChange={(e) => set({ successMsg: e.target.value })} hint="Hiện ngay sau khi thanh toán và gửi kèm thư xác nhận: đường dẫn tải, cách liên hệ…" />

          <div>
            <div className="ds-label mb-1">Cài đặt nâng cao</div>
            <div className="rounded-2xl border border-line px-4 divide-y divide-line [&>*]:py-4">
              <div>
                <Toggle checked={f.questionOn} onChange={(v) => set({ questionOn: v })} label="Hỏi người mua một câu" desc="Thu thông tin bạn cần để giao sản phẩm, ví dụ kích cỡ hay nội dung đặt vẽ." />
                {f.questionOn && <Input className="mt-3" value={f.question} maxLength={120} error={errors.question} placeholder="Ví dụ: Bạn muốn vẽ ai?" onChange={(e) => set({ question: e.target.value })} />}
              </div>
              <div>
                <Toggle checked={f.limitOn} onChange={(v) => set({ limitOn: v })} label="Giới hạn số lượng" desc="Tự ngừng bán khi đủ số suất." />
                {f.limitOn && <Input className="mt-3 max-w-[200px]" inputMode="numeric" inputClassName="num" suffix="suất" value={f.limitText} error={errors.limit}
                  hint={sold > 0 ? `Đã bán ${sold}` : undefined} onChange={(e) => set({ limitText: e.target.value.replace(/\D/g, '').slice(0, 5) })} />}
              </div>
              <div>
                <Toggle checked={f.memberOn} onChange={(v) => set({ memberOn: v })} label="Giá riêng cho hội viên" desc="Hội viên đang hoạt động được mua với giá ưu đãi." />
                {f.memberOn && <MoneyInput className="mt-3 max-w-[260px]" value={f.memberPrice} error={errors.memberPrice} onChange={(v) => set({ memberPrice: v })} />}
              </div>
              <Toggle checked={f.ratings} onChange={(v) => set({ ratings: v })} label="Cho đánh giá" desc="Người đã mua có thể chấm sao và để lại nhận xét công khai." />
            </div>
          </div>

          <div className="xl:hidden border-t border-line pt-6">{preview}</div>
        </div>
      </FlowShell>

      <Confirm open={askDiscard} onClose={() => setAskDiscard(false)} onConfirm={onClose} danger confirmLabel="Bỏ thay đổi" cancelLabel="Tiếp tục sửa"
        title="Bỏ các thay đổi chưa lưu?" desc="Những gì bạn vừa chỉnh sẽ không được giữ lại." />
    </>
  )
}
