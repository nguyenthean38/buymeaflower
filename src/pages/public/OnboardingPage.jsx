import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Search, Check, PartyPopper, Link2 } from 'lucide-react'
import { Avatar, Button, Input, Textarea, Field } from '@/components/ui'
import { Logo } from '@/components/brand/Logo'
import { PetalRain } from '@/components/brand/Flower'
import { cn } from '@/lib/cn'
import { stripAccents } from '@/lib/format'
import { BANKS, AVATAR_COLORS, CATEGORIES, DOMAIN } from '@/data/reference'
import { useApp, useAuth } from '@/store'
import { copyText } from '@/features/support/SupportBox'

/** Hoàn thiện trang sau khi đăng ký: hồ sơ → tài khoản nhận tiền → xong. */
export default function OnboardingPage() {
  const nav = useNavigate()
  const { signedIn, onboarded, finishOnboarding, signOut } = useAuth()
  const page = useApp((s) => s.page)
  const mutate = useApp((s) => s.mutate)
  const [step, setStep] = useState(0)
  const [f, setF] = useState({ name: page.name === page.username ? '' : page.name, tagline: '', about: '', link: '', avatarColor: page.avatarColor, category: page.category })
  const [bank, setBank] = useState({ bankId: '', number: '', holder: '' })
  const [q, setQ] = useState('')
  const [err, setErr] = useState({})

  if (!signedIn) return <Navigate to="/dang-ky" replace />
  if (onboarded && step < 2) return <Navigate to="/quan-ly" replace />

  const saveProfile = () => {
    if (!f.name.trim()) { setErr({ name: 'Cho mọi người biết nên gọi bạn là gì' }); return }
    mutate((d) => { Object.assign(d.page, { name: f.name.trim(), tagline: f.tagline.trim(), about: f.about.trim(), avatarColor: f.avatarColor, category: f.category, socials: f.link.trim() ? [f.link.trim()] : [] }) })
    setErr({}); setStep(1)
  }
  const saveBank = () => {
    const e = {}
    if (!bank.bankId) e.bank = 'Chọn ngân hàng của bạn'
    if (bank.number.replace(/\s/g, '').length < 8) e.number = 'Số tài khoản cần ít nhất 8 chữ số'
    if (!bank.holder.trim()) e.holder = 'Nhập tên chủ tài khoản'
    setErr(e)
    if (Object.keys(e).length) return
    mutate((d) => { d.payout.connected = true; d.payout.bank = { ...bank } })
    finish()
  }
  const finish = () => { finishOnboarding(); setStep(2) }
  const banks = BANKS.filter((b) => stripAccents(b.name).toLowerCase().includes(stripAccents(q).toLowerCase()))

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="flex h-16 items-center justify-between px-5 sm:px-8">
        <Logo size={24} to={null} />
        <Button variant="ghost" size="sm" onClick={() => { signOut(); nav('/') }}>Đăng xuất</Button>
      </header>

      <main className="mx-auto w-full max-w-[640px] flex-1 px-5 py-6 sm:py-10" key={step}>
        {step === 0 && (
          <div className="animate-fade-in">
            <h1 className="text-center text-[26px] font-[750] tracking-tight">Hoàn thiện trang của bạn</h1>
            <p className="mt-1.5 text-center text-[14.5px] text-muted">Vài thông tin để người ghé thăm biết bạn là ai.</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-[150px_1fr]">
              <div className="flex flex-col items-center gap-3">
                <Avatar name={f.name || page.username} color={f.avatarColor} size={120} />
                <div className="flex flex-wrap justify-center gap-1.5">
                  {AVATAR_COLORS.slice(0, 6).map((c) => <button key={c} onClick={() => setF({ ...f, avatarColor: c })} aria-label={`Màu ${c}`} className={cn('size-6 rounded-full ring-offset-2 ring-offset-surface', f.avatarColor === c && 'ring-2 ring-fg')} style={{ background: c }} />)}
                </div>
              </div>
              <div className="space-y-4">
                <Input label="Tên hiển thị" autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={err.name} placeholder="Tên bạn hoặc tên kênh" maxLength={40} />
                <Input label="Bạn đang làm gì?" optional value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} placeholder="đang vẽ tranh, đang làm podcast…" maxLength={80} />
                <Field label="Lĩnh vực">
                  <div className="flex flex-wrap gap-1.5">{CATEGORIES.map((c) => <button key={c} onClick={() => setF({ ...f, category: c })} className={cn('rounded-full border px-3 py-1 text-[13px]', f.category === c ? 'border-brand-400 bg-brand-50 font-[550] text-brand-ink' : 'border-line text-dim hover:bg-subtle')}>{c}</button>)}</div>
                </Field>
                <Textarea label="Giới thiệu" optional rows={4} value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} placeholder="Kể về đam mê của bạn và khoản ủng hộ sẽ giúp gì cho công việc. Vài dòng chân thành là đủ." />
                <Input label="Trang web hoặc mạng xã hội" optional prefix={Link2} value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://" />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mx-auto max-w-[460px] animate-fade-in">
            <h1 className="text-center text-[26px] font-[750] tracking-tight">Bạn muốn nhận tiền về đâu?</h1>
            <p className="mt-1.5 text-center text-[14.5px] text-muted">Liên kết tài khoản ngân hàng để nhận tiền ủng hộ. Có thể bỏ qua và làm sau.</p>
            <label className="mt-6 flex h-11 items-center gap-2.5 rounded-xl bg-subtle px-3.5"><Search size={16} className="text-faint" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm ngân hàng" className="min-w-0 flex-1 bg-transparent text-[14px] outline-none" /></label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {banks.map((b) => (
                <button key={b.id} onClick={() => setBank({ ...bank, bankId: b.id })} aria-pressed={bank.bankId === b.id} title={b.name}
                  className={cn('relative flex h-16 flex-col items-center justify-center rounded-2xl border px-1 text-[13px] font-[750] transition-colors', bank.bankId === b.id ? 'border-brand-400 bg-brand-50' : 'border-line hover:bg-subtle')} style={{ color: b.color }}>
                  {b.short}<span className="max-w-full truncate text-[10.5px] font-[500] text-muted">{b.name.replace('Ngân hàng ', '')}</span>
                  {bank.bankId === b.id && <Check size={14} className="absolute right-1.5 top-1.5 text-brand-ink" />}
                </button>
              ))}
            </div>
            {err.bank && <p className="mt-1.5 text-[12.5px] text-neg">{err.bank}</p>}
            <div className="mt-4 space-y-3">
              <Input label="Số tài khoản" inputMode="numeric" value={bank.number} onChange={(e) => setBank({ ...bank, number: e.target.value.replace(/[^\d ]/g, '').slice(0, 20) })} error={err.number} />
              <Input label="Tên chủ tài khoản" value={bank.holder} onChange={(e) => setBank({ ...bank, holder: stripAccents(e.target.value).toUpperCase() })} error={err.holder} hint="Viết hoa không dấu, đúng như trên thẻ." />
            </div>
            <p className="mt-4 ds-caption">Tên ngân hàng trong bản demo là tên hư cấu. Thông tin chỉ lưu trong trình duyệt của bạn.</p>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto flex max-w-[440px] animate-fade-in flex-col items-center pt-6 text-center">
            <PetalRain />
            <span className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-ink"><PartyPopper size={28} /></span>
            <h1 className="mt-5 text-[28px] font-[800] tracking-tight">Trang của bạn đã nở hoa!</h1>
            <p className="mt-2 text-[15px] text-muted">Hãy chia sẻ liên kết này ở phần giới thiệu mạng xã hội, cuối video hay bài viết của bạn.</p>
            <div className="mt-5 flex w-full items-center gap-2 rounded-full border border-line-strong bg-subtle py-1.5 pl-5 pr-1.5">
              <span className="num min-w-0 flex-1 truncate text-left text-[15px] font-[600]">{DOMAIN}/{page.username}</span>
              <Button variant="primary" onClick={() => copyText(`https://${DOMAIN}/${page.username}`, 'Đã sao chép liên kết trang')}>Sao chép</Button>
            </div>
            <div className="mt-6 flex gap-2">
              <Button size="lg" onClick={() => nav(`/${page.username}`)}>Xem trang</Button>
              <Button size="lg" variant="primary" onClick={() => nav('/quan-ly')}>Vào bảng quản lý</Button>
            </div>
          </div>
        )}
      </main>

      {step < 2 && (
        <footer className="sticky bottom-0 border-t border-line bg-surface">
          <div className="flex h-1 bg-line"><span className="bg-brand-500 transition-all duration-500" style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
          <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
            {step === 1 ? <Button variant="ghost" onClick={() => setStep(0)}>Quay lại</Button> : <span className="ds-caption">Bước {step + 1} / 2</span>}
            <div className="flex items-center gap-2">
              {step === 1 && <button onClick={finish} className="px-3 text-[13.5px] font-[550] text-muted underline underline-offset-4 hover:text-fg">Bỏ qua bước này</button>}
              <Button variant="primary" size="lg" onClick={step === 0 ? saveProfile : saveBank}>{step === 0 ? 'Tiếp tục' : 'Liên kết và hoàn tất'}</Button>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
