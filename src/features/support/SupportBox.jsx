import { useState } from 'react'
import { Link2, Lock, X as XIcon } from 'lucide-react'
import { Button, Checkbox, Modal, Avatar } from '@/components/ui'
import { PetalRain } from '@/components/brand/Flower'
import { cn } from '@/lib/cn'
import { formatVND } from '@/lib/format'
import { DOMAIN, PLATFORM_FEE } from '@/data/reference'
import { useApp, toast } from '@/store'
import { PaymentModal } from './PaymentModal'

/** Sao chép vào bộ nhớ tạm kèm thông báo */
export function copyText(text, msg = 'Đã sao chép') {
  const done = () => toast(msg)
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, done)
  else done()
}

/** Màn hình cảm ơn sau khi thanh toán xong (dùng chung cho tặng hoa, hội viên, cửa hàng) */
export function ThankYouModal({ open, onClose, creator, title, message }) {
  if (!open) return null
  const { page } = creator
  const url = `https://${DOMAIN}/${page.username}`
  return (
    <>
      <PetalRain />
      <Modal open={open} onClose={onClose} size="sm" hideClose>
        <div className="flex flex-col items-center pb-2 pt-3 text-center">
          <Avatar name={page.name} color={page.avatarColor} size={72} className="ring-4 ring-brand-50" />
          <h2 className="mt-4 text-[20px] font-[700] tracking-tight">{title}</h2>
          {message && <p className="mt-2 rounded-2xl bg-subtle px-4 py-3 text-[14px] text-dim">“{message}”<span className="mt-1 block ds-caption">— {page.name}</span></p>}
          <p className="mt-4 text-[13px] text-muted">Rủ thêm bạn bè cùng ủng hộ {page.name} nhé</p>
          <div className="mt-2.5 flex gap-2">
            <Button variant="outline" size="sm" icon={Link2} onClick={() => copyText(url, 'Đã sao chép liên kết trang')}>Sao chép liên kết</Button>
            <Button variant="primary" size="sm" onClick={onClose}>Xong</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

/**
 * Ô tặng hoa trên trang cá nhân.
 * creator: kết quả của resolveCreator(). compact: bản thu gọn cho trang giới thiệu.
 */
export function SupportBox({ creator, className, compact }) {
  const { page, settings } = creator
  const addSupport = useApp((s) => s.addSupport)
  const presets = settings.presets?.length ? settings.presets : [1, 3, 5]
  const [qty, setQty] = useState(presets[0])
  const [custom, setCustom] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [priv, setPriv] = useState(false)
  const [paying, setPaying] = useState(false)
  const [thanks, setThanks] = useState(false)

  const n = Math.max(1, Math.min(999, Number(custom) || qty))
  const sub = n * settings.unitPrice
  const fee = settings.coverFee ? Math.round(sub * PLATFORM_FEE) : 0
  const total = sub + fee

  const paid = () => {
    addSupport(page.username, { type: 'flower', name: name.trim() || 'Một người bạn giấu tên', qty: n, amount: sub, message: message.trim(), private: priv })
    setPaying(false); setThanks(true); setMessage(''); setCustom('')
  }

  return (
    <div className={cn('card rounded-3xl p-5 sm:p-6', className)}>
      <h2 className="text-[19px] font-[700] tracking-tight">Tặng <span className="text-page">{page.name}</span> một {page.item.name}</h2>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-page-soft bg-page-soft px-3 py-3 sm:gap-3 sm:px-4">
        <span className="text-[34px] leading-none" aria-hidden>{page.item.emoji}</span>
        <XIcon size={15} className="text-faint" />
        {presets.map((p) => (
          <button key={p} onClick={() => { setQty(p); setCustom('') }} aria-pressed={!custom && qty === p} aria-label={`${p} ${page.item.name}`}
            className={cn('num grid size-10 shrink-0 place-items-center rounded-full border text-[15px] font-[650] transition-all sm:size-11',
              !custom && qty === p ? 'border-transparent bg-page text-white scale-105 shadow-sm' : 'border-page-soft bg-surface text-page hover:scale-105')}>
            {p}
          </button>
        ))}
        <input inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="10" aria-label="Số lượng khác"
          className={cn('num h-10 w-12 min-w-0 flex-1 rounded-xl border bg-surface px-2 text-center text-[15px] font-[600] outline-none transition-colors sm:h-11', custom ? 'border-page' : 'border-line focus:border-page')} />
      </div>

      <div className="mt-3 space-y-2.5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên hoặc @tài khoản của bạn (không bắt buộc)" maxLength={50}
          className="h-11 w-full rounded-xl bg-subtle px-3.5 text-[14px] outline-none ring-page/40 transition-shadow focus:ring-2" />
        {!compact && (
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={300} placeholder="Nhắn đôi lời dễ thương… (không bắt buộc)"
            className="w-full resize-none rounded-xl bg-subtle px-3.5 py-3 text-[14px] outline-none ring-page/40 transition-shadow focus:ring-2" />
        )}
        {!compact && <Checkbox checked={priv} onChange={setPriv} label={<span className="inline-flex items-center gap-1.5"><Lock size={13} className="text-muted" /> Chỉ {page.name} đọc được lời nhắn này</span>} />}
      </div>

      <button onClick={() => setPaying(true)}
        className="mt-4 h-12 w-full rounded-full bg-page text-[15px] font-[650] text-white shadow-sm transition-[filter,transform] hover:brightness-95 active:scale-[.99]">
        Tặng {formatVND(total)}
      </button>
      <p className="mt-2.5 text-center ds-caption">
        {n} {page.item.name} × {formatVND(settings.unitPrice)}{fee > 0 && <> + {formatVND(fee)} phí giao dịch</>}
      </p>
      {settings.charity?.on && settings.charity.name && (
        <p className="mt-3 rounded-xl bg-pos-soft px-3 py-2 text-center text-[12.5px] text-pos">🌱 {settings.charity.percent}% khoản này được gửi tới {settings.charity.name}</p>
      )}

      <PaymentModal open={paying} onClose={() => setPaying(false)} amount={total} onSuccess={paid}
        title={`Tặng ${n} ${page.item.name} cho ${page.name}`}
        lines={[{ label: `${n} ${page.item.name} × ${formatVND(settings.unitPrice)}`, value: formatVND(sub) }, fee > 0 && { label: 'Phí giao dịch (5%)', value: formatVND(fee) }].filter(Boolean)} />
      <ThankYouModal open={thanks} onClose={() => setThanks(false)} creator={creator} title={`Hoa đã tới tay ${page.name}! ${page.item.emoji}`} message={settings.thankYou} />
    </div>
  )
}
