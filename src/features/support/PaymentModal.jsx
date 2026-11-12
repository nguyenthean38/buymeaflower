import { useEffect, useState } from 'react'
import { QrCode as QrIcon, Wallet, CreditCard, ShieldCheck, Check, Lock } from 'lucide-react'
import { Modal, Button, Input, QrCode } from '@/components/ui'
import { Flower } from '@/components/brand/Flower'
import { cn } from '@/lib/cn'
import { formatVND } from '@/lib/format'

const METHODS = [
  { id: 'qr', label: 'Mã QR', icon: QrIcon },
  { id: 'wallet', label: 'Ví điện tử', icon: Wallet },
  { id: 'card', label: 'Thẻ', icon: CreditCard },
]
const WALLETS = [{ id: 'bong', name: 'Ví Bông', color: '#e83e7c' }, { id: 'la', name: 'Ví Lá', color: '#2f9e6e' }, { id: 'nang', name: 'Ví Nắng', color: '#e0a019' }]

/**
 * Cổng thanh toán mô phỏng. Không có tiền thật nào được chuyển.
 * <PaymentModal open amount={60000} title="Tặng 3 bông hoa cho Mai Chi" lines={[{label,value}]} onClose onSuccess={(method) => …} />
 */
export function PaymentModal({ open, onClose, amount, title, lines = [], onSuccess }) {
  const [method, setMethod] = useState('qr')
  const [wallet, setWallet] = useState('bong')
  const [card, setCard] = useState({ number: '', exp: '', cvc: '', name: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [left, setLeft] = useState(600)

  useEffect(() => {
    if (!open) return
    setBusy(false); setErrors({}); setLeft(600)
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [open])

  const pay = () => {
    if (method === 'card') {
      const e = {}
      if (card.number.replace(/\s/g, '').length < 16) e.number = 'Số thẻ gồm 16 chữ số'
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.exp)) e.exp = 'Dạng MM/YY'
      if (card.cvc.length < 3) e.cvc = '3 chữ số'
      if (!card.name.trim()) e.name = 'Nhập tên in trên thẻ'
      setErrors(e)
      if (Object.keys(e).length) return
    }
    setBusy(true)
    setTimeout(() => { setBusy(false); onSuccess?.(method) }, 1100)
  }

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExp = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d }
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0')

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} title="Thanh toán" desc={title} size="md">
      <div className="rounded-2xl bg-subtle px-4 py-3.5">
        {lines.map((l) => (
          <div key={l.label} className="flex items-center justify-between gap-4 py-1 text-[13.5px]">
            <span className="text-muted">{l.label}</span><span className="num text-fg">{l.value}</span>
          </div>
        ))}
        <div className={cn('flex items-center justify-between gap-4', lines.length > 0 && 'mt-1.5 border-t border-line pt-2.5')}>
          <span className="font-[600]">Tổng thanh toán</span>
          <span className="num text-[20px] font-[700] tracking-tight">{formatVND(amount)}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2" role="tablist" aria-label="Cách thanh toán">
        {METHODS.map((m) => (
          <button key={m.id} role="tab" aria-selected={method === m.id} onClick={() => setMethod(m.id)}
            className={cn('flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-[13px] font-[550] transition-colors',
              method === m.id ? 'border-brand-400 bg-brand-50 text-brand-ink' : 'border-line text-dim hover:bg-subtle')}>
            <m.icon size={19} />{m.label}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-[214px]">
        {method === 'qr' && (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative rounded-2xl border border-line bg-white p-3 text-[#2b1622]">
              <QrCode value={`bmf-${amount}-${title}`} size={156} />
              <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white"><Flower size={24} /></span>
            </div>
            <ol className="flex-1 space-y-2.5 text-[13.5px] text-dim">
              {['Mở ứng dụng ngân hàng hoặc ví trên điện thoại', 'Chọn “Quét mã QR” và đưa máy vào mã bên cạnh', 'Kiểm tra số tiền rồi xác nhận chuyển'].map((t, i) => (
                <li key={i} className="flex gap-2.5"><span className="num grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-[11.5px] font-[650] text-brand-ink">{i + 1}</span>{t}</li>
              ))}
              <li className="ds-caption pt-1">Mã hết hạn sau <span className="num font-[600] text-fg">{mm}:{ss}</span>. Đây là mã minh hoạ, không quét được.</li>
            </ol>
          </div>
        )}
        {method === 'wallet' && (
          <div className="space-y-2">
            {WALLETS.map((w) => (
              <button key={w.id} onClick={() => setWallet(w.id)} aria-pressed={wallet === w.id}
                className={cn('flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors', wallet === w.id ? 'border-brand-400 bg-brand-50' : 'border-line hover:bg-subtle')}>
                <span className="grid size-9 place-items-center rounded-xl text-white" style={{ background: w.color }}><Wallet size={17} /></span>
                <span className="flex-1"><span className="block text-[14px] font-[600]">{w.name}</span><span className="ds-caption">Ví minh hoạ của bản demo</span></span>
                {wallet === w.id && <Check size={17} className="text-brand-ink" />}
              </button>
            ))}
          </div>
        )}
        {method === 'card' && (
          <div className="grid grid-cols-2 gap-3">
            <Input className="col-span-2" label="Số thẻ" inputMode="numeric" placeholder="0000 0000 0000 0000" value={card.number} onChange={(e) => setCard({ ...card, number: fmtCard(e.target.value) })} error={errors.number} prefix={CreditCard} />
            <Input label="Ngày hết hạn" inputMode="numeric" placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: fmtExp(e.target.value) })} error={errors.exp} />
            <Input label="Mã bảo mật" inputMode="numeric" placeholder="CVC" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} error={errors.cvc} prefix={Lock} />
            <Input className="col-span-2" label="Tên in trên thẻ" placeholder="NGUYEN VAN A" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })} error={errors.name} />
          </div>
        )}
      </div>

      <Button variant="primary" size="lg" className="mt-2 w-full" loading={busy} onClick={pay}>
        {busy ? 'Đang xác nhận…' : method === 'qr' ? 'Tôi đã chuyển khoản' : `Thanh toán ${formatVND(amount)}`}
      </Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 ds-caption"><ShieldCheck size={14} className="text-pos" /> Bản demo: không có khoản tiền thật nào được chuyển.</p>
    </Modal>
  )
}
