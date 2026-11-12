import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button, Input, Divider } from '@/components/ui'
import { useAuth, toast } from '@/store'
import { CenterShell, SocialButtons } from '@/features/public/AuthShell'

export default function LoginPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const [params] = useSearchParams()
  const { signedIn, onboarded, signInDemo } = useAuth()
  const [step, setStep] = useState(0) // 0: email · 1: mật khẩu
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const dest = loc.state?.from || '/quan-ly'

  const demo = () => { setBusy(true); setTimeout(() => { signInDemo(); nav(dest, { replace: true }) }, 450) }
  useEffect(() => { if (params.get('demo') === '1' && !signedIn) demo() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (signedIn && !busy) return <Navigate to={onboarded ? dest : '/hoan-thien'} replace />

  const submit = (e) => {
    e.preventDefault()
    if (step === 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Email chưa đúng định dạng'); return }
      setErr(''); setStep(1); return
    }
    if (pw.length < 6) { setErr('Mật khẩu chưa đúng'); return }
    toast({ title: 'Bản demo: đăng nhập vào tài khoản mẫu Mai Chi', tone: 'info' })
    demo()
  }

  return (
    <CenterShell topRight={<>Chưa có tài khoản? <Link to="/dang-ky" className="font-[600] text-fg underline underline-offset-4">Đăng ký</Link></>}>
      <h1 className="text-center text-[28px] font-[800] tracking-tight">Mừng bạn trở lại</h1>
      <p className="mt-1.5 text-center text-[14.5px] text-muted">Đăng nhập để xem ai vừa tặng hoa cho bạn.</p>

      <button onClick={demo} disabled={busy} className="mt-7 flex w-full items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3.5 text-left transition-colors hover:bg-brand-100 disabled:opacity-60">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white"><Sparkles size={18} /></span>
        <span className="flex-1"><span className="block text-[14.5px] font-[650] text-fg">Vào bằng tài khoản demo</span><span className="text-[12.5px] text-dim">Hoạ sĩ Mai Chi · có sẵn dữ liệu để khám phá</span></span>
      </button>

      <Divider label="hoặc dùng email" className="my-5" />
      <form onSubmit={submit} className="space-y-3">
        <Input size="lg" type="email" autoComplete="email" placeholder="Email" aria-label="Email" value={email} onChange={(e) => { setEmail(e.target.value); setErr('') }} error={step === 0 ? err : undefined} disabled={step === 1} />
        {step === 1 && <Input size="lg" type="password" autoFocus autoComplete="current-password" placeholder="Mật khẩu" aria-label="Mật khẩu" value={pw} onChange={(e) => { setPw(e.target.value); setErr('') }} error={err} />}
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>{step === 0 ? 'Tiếp tục bằng email' : 'Đăng nhập'}</Button>
        {step === 1 && (
          <div className="flex justify-between text-[13.5px]">
            <button type="button" onClick={() => { setStep(0); setErr('') }} className="text-muted hover:text-fg">← Đổi email</button>
            <Link to={`/quen-mat-khau?email=${encodeURIComponent(email)}`} className="font-[550] text-brand-ink hover:underline">Quên mật khẩu?</Link>
          </div>
        )}
      </form>
      {step === 0 && (<><Divider label="hoặc" className="my-5" /><SocialButtons onPick={(n) => { toast({ title: `Bản demo: đăng nhập bằng ${n} được mô phỏng`, tone: 'info' }); demo() }} /></>)}
    </CenterShell>
  )
}
