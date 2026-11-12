import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, BadgeCheck, Check, Clock, ShieldCheck, Store, User, X } from 'lucide-react'
import { Button, Callout, EmptyState, IconButton, Input, KeyValue, OtpInput, RadioCards, SearchInput } from '@/components/ui'
import { Flower } from '@/components/brand/Flower'
import { Logo } from '@/components/brand/Logo'
import { useApp, toast } from '@/store'
import { BANKS } from '@/data/reference'
import { stripAccents } from '@/lib/format'
import { cn } from '@/lib/cn'

const STEPS = ['Thông tin liên hệ', 'Xác minh số điện thoại', 'Loại hình', 'Tài khoản ngân hàng', 'Xem lại']
const TYPES = [
  { value: 'personal', label: 'Cá nhân', desc: 'Bạn nhận tiền dưới tên của chính mình.', icon: User },
  { value: 'household', label: 'Hộ kinh doanh', desc: 'Bạn có giấy đăng ký hộ kinh doanh.', icon: Store },
]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const bankById = (id) => BANKS.find((b) => b.id === id)
export const digitsOf = (s = '') => String(s).replace(/\D/g, '')
export const groupDigits = (s = '') => digitsOf(s).replace(/(\d{4})(?=\d)/g, '$1 ')
/** Che số tài khoản, chỉ lộ 4 số cuối */
export const maskAccount = (number) => `•••• •••• ${digitsOf(number).slice(-4)}`
const toHolder = (s) => stripAccents(s).toUpperCase().replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trimStart()

/** Logo chữ của ngân hàng hư cấu */
export function BankLogo({ bank, className }) {
  return (
    <span className={cn('grid h-9 w-[64px] shrink-0 place-items-center rounded-lg px-1 text-[10px] font-[800] leading-none tracking-tight text-white', className)} style={{ background: bank?.color || '#7d6570' }}>
      {bank?.short || 'Ngân hàng'}
    </span>
  )
}

function validate(step, f) {
  const e = {}
  if (step === 0) {
    if (!EMAIL_RE.test(f.email.trim())) e.email = 'Email chưa đúng định dạng.'
    if (!/^0\d{9}$/.test(digitsOf(f.phone))) e.phone = 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.'
  } else if (step === 1) {
    if (f.otp.replace(/\s/g, '').length < 6) e.otp = 'Hãy nhập đủ 6 chữ số.'
  } else if (step === 2) {
    if (f.legalName.trim().split(/\s+/).filter(Boolean).length < 2) e.legalName = 'Hãy nhập đầy đủ họ và tên như trên giấy tờ.'
  } else if (step === 3) {
    if (!f.bankId) e.bankId = 'Hãy chọn ngân hàng của bạn.'
    const n = digitsOf(f.number).length
    if (n < 6 || n > 16) e.number = 'Số tài khoản gồm 6 đến 16 chữ số.'
    if (f.holder.trim().length < 3) e.holder = 'Hãy nhập tên chủ tài khoản.'
  }
  return e
}

/**
 * Luồng liên kết tài khoản nhận tiền, phủ toàn màn hình.
 * <BankLinkFlow initial={payout.bank} onClose={…} />
 */
export function BankLinkFlow({ initial, onClose }) {
  const accountEmail = useApp((s) => s.account.email)
  const mutate = useApp((s) => s.mutate)
  const [step, setStep] = useState(0)
  const [tried, setTried] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [query, setQuery] = useState('')
  const [f, setF] = useState({ email: accountEmail || '', phone: '', otp: '', type: 'personal', legalName: '', bankId: initial?.bankId || '', number: '', holder: '' })
  const set = (patch) => setF((cur) => ({ ...cur, ...patch }))

  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = prev }
  }, [])
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !loading) onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [loading, onClose])
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const errors = tried ? validate(step, f) : {}
  const bank = bankById(f.bankId)
  const banks = useMemo(() => {
    const q = stripAccents(query).toLowerCase().trim()
    return q ? BANKS.filter((b) => stripAccents(`${b.name} ${b.short}`).toLowerCase().includes(q)) : BANKS
  }, [query])

  const sendCode = () => { setCooldown(30); toast({ title: 'Đã gửi mã xác minh', desc: `Kiểm tra tin nhắn ở số ${f.phone.trim()}. Bản demo nhận mã nào cũng được.` }) }

  const finish = () => {
    setLoading(true)
    setTimeout(() => {
      mutate((d) => {
        d.payout.connected = true
        d.payout.bank = { bankId: f.bankId, number: groupDigits(f.number), holder: f.holder.trim() }
      })
      toast({ title: 'Đã liên kết tài khoản ngân hàng', desc: `${bank.name} · ${maskAccount(f.number)}` })
      onClose()
    }, 1200)
  }

  const next = (e) => {
    e?.preventDefault()
    if (loading) return
    if (Object.keys(validate(step, f)).length) { setTried(true); return }
    setTried(false)
    if (step === 4) return finish()
    if (step === 0) sendCode()
    if (step === 2 && !f.holder) set({ holder: toHolder(f.legalName).trim() })
    setStep(step + 1)
  }
  const back = () => { setTried(false); setStep(step - 1) }

  return createPortal(
    <div data-overlay role="dialog" aria-modal="true" aria-label="Liên kết tài khoản ngân hàng" className="fixed inset-0 z-[75] flex animate-fade-in flex-col bg-surface lg:flex-row">
      {/* Cột thương hiệu */}
      <aside className="relative hidden w-[40%] max-w-[520px] shrink-0 flex-col justify-between overflow-hidden bg-[#e0356f] p-10 text-white lg:flex">
        <Flower size={260} color="rgba(255,255,255,.1)" center="rgba(255,255,255,.14)" className="absolute -right-20 -top-16" />
        <Flower size={180} color="rgba(255,255,255,.08)" center="rgba(255,255,255,.12)" className="absolute -bottom-12 -left-12" />
        <span className="relative inline-flex items-center gap-2">
          <Flower size={28} color="#ffffff" center="#ffd66b" />
          <span className="text-[18px] font-[800] tracking-[-0.03em]">Buy me a flower</span>
        </span>
        <div className="relative">
          <p className="text-[26px] font-[700] leading-[1.25] tracking-tight">Buy Me a Flower hợp tác với cổng thanh toán Cánh Đồng (hư cấu) để chuyển tiền an toàn.</p>
          <ul className="mt-7 flex flex-col gap-3.5 text-[14px] text-white/90">
            <li className="flex items-center gap-3"><ShieldCheck size={18} className="shrink-0" />Thông tin của bạn được mã hoá khi truyền đi</li>
            <li className="flex items-center gap-3"><Clock size={18} className="shrink-0" />Tiền về tài khoản sau 1–2 ngày làm việc</li>
            <li className="flex items-center gap-3"><BadgeCheck size={18} className="shrink-0" />Liên kết miễn phí, đổi tài khoản lúc nào cũng được</li>
          </ul>
        </div>
        <p className="relative text-[12.5px] text-white/70">Mọi bước trong luồng này là mô phỏng của bản demo, không có dữ liệu nào được gửi đi.</p>
      </aside>

      {/* Cột biểu mẫu */}
      <form onSubmit={next} noValidate className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-1.5">
            {step > 0
              ? <IconButton icon={ArrowLeft} label="Quay lại" onClick={back} disabled={loading} />
              : <span className="pl-2 lg:hidden"><Logo to={null} size={22} wordmark={false} /></span>}
            <span className="truncate text-[13.5px] text-muted"><span className="font-[600] text-fg">Bước {step + 1}/{STEPS.length}</span> · {STEPS[step]}</span>
          </div>
          <IconButton icon={X} label="Đóng" onClick={onClose} disabled={loading} />
        </div>
        <div className="h-1 shrink-0 bg-subtle" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
          <div className="h-full rounded-r-full bg-brand-500 transition-[width] duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div key={step} className="mx-auto flex w-full max-w-[460px] animate-slide-up flex-col gap-5 px-5 py-8 sm:py-12">
            {step === 0 && <>
              <Heading title="Bắt đầu với thông tin liên hệ" desc="Cổng thanh toán Cánh Đồng dùng email và số điện thoại để xác minh và báo tin mỗi lần chuyển tiền." />
              <Input label="Email" type="email" autoFocus value={f.email} onChange={(e) => set({ email: e.target.value })} error={errors.email} autoComplete="email" />
              <Input label="Số điện thoại" inputMode="tel" placeholder="0912 345 678" value={f.phone} onChange={(e) => set({ phone: e.target.value.replace(/[^\d\s]/g, '').slice(0, 13) })} error={errors.phone} hint="Mã xác minh 6 số sẽ được gửi tới số này." autoComplete="tel" />
            </>}

            {step === 1 && <>
              <Heading title="Nhập mã xác minh" desc={<>Mã gồm 6 chữ số đã được gửi tới <span className="font-[600] text-fg">{f.phone.trim()}</span>.</>} />
              <div>
                <div className="max-w-full [&_input]:size-11 sm:[&_input]:size-12"><OtpInput value={f.otp} onChange={(otp) => set({ otp })} /></div>
                {errors.otp && <p className="mt-1.5 text-[12.5px] text-neg">{errors.otp}</p>}
              </div>
              <div className="text-[13.5px] text-muted">
                Chưa nhận được mã?{' '}
                {cooldown > 0
                  ? <span className="num text-faint">Gửi lại sau {cooldown} giây</span>
                  : <button type="button" onClick={sendCode} className="font-[600] text-brand-ink underline-offset-4 hover:underline">Gửi lại mã</button>}
              </div>
              <Callout tone="neutral">Đây là bản demo: bạn nhập 6 chữ số bất kỳ là được.</Callout>
            </>}

            {step === 2 && <>
              <Heading title="Bạn nhận tiền với tư cách nào?" desc="Thông tin này quyết định giấy tờ cần đối chiếu khi chuyển tiền." />
              <RadioCards value={f.type} onChange={(type) => set({ type })} options={TYPES} columns={2} />
              <Input label={f.type === 'personal' ? 'Họ và tên theo giấy tờ tuỳ thân' : 'Họ và tên chủ hộ theo giấy đăng ký'} placeholder="Nguyễn Mai Chi" value={f.legalName}
                onChange={(e) => set({ legalName: e.target.value })} error={errors.legalName} autoComplete="name" />
            </>}

            {step === 3 && <>
              <Heading title="Tiền sẽ về tài khoản nào?" desc="Chọn ngân hàng rồi nhập số tài khoản. Tên chủ tài khoản cần trùng với họ tên trên giấy tờ." />
              <div className="flex flex-col gap-2">
                <SearchInput value={query} onChange={setQuery} placeholder="Tìm ngân hàng" />
                <div className="grid max-h-[236px] grid-cols-1 gap-2 overflow-y-auto p-0.5 min-[420px]:grid-cols-2" role="radiogroup" aria-label="Ngân hàng">
                  {banks.map((b) => {
                    const on = f.bankId === b.id
                    return (
                      <button key={b.id} type="button" role="radio" aria-checked={on} onClick={() => set({ bankId: b.id })}
                        className={cn('flex items-center gap-2.5 rounded-xl border p-2 text-left transition-[border,background,box-shadow]', on ? 'border-brand-400 bg-brand-50 ring-[3px] ring-brand-100' : 'border-line-strong hover:border-faint')}>
                        <BankLogo bank={b} />
                        <span className="min-w-0 flex-1 truncate text-[13px] font-[550]">{b.name.replace('Ngân hàng ', '')}</span>
                        {on && <Check size={15} strokeWidth={3} className="mr-1 shrink-0 text-brand-ink" />}
                      </button>
                    )
                  })}
                  {!banks.length && <EmptyState compact className="col-span-full" title="Không tìm thấy ngân hàng" desc="Thử tìm bằng tên khác nhé." />}
                </div>
                {errors.bankId && <p className="text-[12.5px] text-neg">{errors.bankId}</p>}
              </div>
              <Input label="Số tài khoản" inputMode="numeric" placeholder="0000 0000 0000" value={groupDigits(f.number)} inputClassName="num"
                onChange={(e) => set({ number: digitsOf(e.target.value).slice(0, 16) })} error={errors.number} />
              <Input label="Tên chủ tài khoản" placeholder="NGUYEN MAI CHI" value={f.holder} onChange={(e) => set({ holder: toHolder(e.target.value) })}
                error={errors.holder} hint="Tự chuyển thành chữ HOA không dấu, giống trên thẻ ngân hàng." autoCapitalize="characters" />
            </>}

            {step === 4 && <>
              <Heading title="Xem lại thông tin" desc="Kiểm tra kỹ số tài khoản. Tiền chuyển nhầm sẽ rất khó lấy lại." />
              <div className="rounded-2xl bg-subtle px-4 py-1">
                <KeyValue items={[
                  { label: 'Email', value: f.email.trim() },
                  { label: 'Số điện thoại', value: f.phone.trim() },
                  { label: 'Loại hình', value: TYPES.find((t) => t.value === f.type).label },
                  { label: 'Họ và tên', value: f.legalName.trim() },
                  { label: 'Ngân hàng', value: <span className="inline-flex items-center justify-end gap-2"><BankLogo bank={bank} className="h-6 w-[52px] text-[8.5px]" />{bank?.name}</span> },
                  { label: 'Số tài khoản', value: <span className="num">{groupDigits(f.number)}</span> },
                  { label: 'Chủ tài khoản', value: f.holder.trim() },
                ]} />
              </div>
              <p className="ds-caption">Khi bấm “Đồng ý và hoàn tất”, bạn cho phép cổng thanh toán Cánh Đồng (hư cấu) chuyển số dư của bạn tới tài khoản trên.</p>
            </>}
          </div>
        </div>

        <div className="shrink-0 border-t border-line px-5 py-4">
          <div className="mx-auto flex w-full max-w-[460px] items-center gap-3">
            {step > 0 && <Button variant="secondary" size="lg" onClick={back} disabled={loading}>Quay lại</Button>}
            <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">{step === 4 ? 'Đồng ý và hoàn tất' : 'Tiếp tục'}</Button>
          </div>
        </div>
      </form>
    </div>,
    document.body,
  )
}

function Heading({ title, desc }) {
  return (
    <div>
      <h2 className="text-[22px] font-[700] leading-tight tracking-tight">{title}</h2>
      <p className="mt-1.5 text-[14px] text-muted">{desc}</p>
    </div>
  )
}
