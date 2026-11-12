import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button, Input, OtpInput, Divider } from '@/components/ui'
import { cn } from '@/lib/cn'
import { DOMAIN } from '@/data/reference'
import { TAKEN_USERNAMES } from '@/data/creators'
import { useAuth, toast } from '@/store'
import { AuthShell, SocialButtons } from '@/features/public/AuthShell'

function strength(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++
  return s
}
const STRENGTH = [['Quá ngắn', 'bg-neg'], ['Yếu', 'bg-neg'], ['Tạm được', 'bg-warn'], ['Tốt', 'bg-pos'], ['Rất mạnh', 'bg-pos']]

export default function SignupPage() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { signedIn, onboarded, register } = useAuth()
  const [step, setStep] = useState(0) // 0: tên trang · 1: tài khoản · 2: mã xác minh
  const [username, setUsername] = useState((params.get('ten') || '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))
  const [checking, setChecking] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [code, setCode] = useState('')
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)

  // giả lập kiểm tra tên trang trên máy chủ
  useEffect(() => { if (!username) return; setChecking(true); const t = setTimeout(() => setChecking(false), 450); return () => clearTimeout(t) }, [username])
  const nameState = useMemo(() => {
    if (!username) return null
    if (username.length < 3) return { ok: false, msg: 'Tên trang cần ít nhất 3 ký tự' }
    if (TAKEN_USERNAMES.includes(username) || username === 'maichi') return { ok: false, msg: `Tên “${username}” đã có người dùng` }
    return { ok: true, msg: 'Tên này còn trống' }
  }, [username])
  const s = strength(pw)

  if (signedIn && onboarded && step === 0) return <Navigate to="/quan-ly" replace />

  const next = (e) => {
    e?.preventDefault()
    if (step === 0) { if (nameState?.ok && !checking) setStep(1); return }
    if (step === 1) {
      const er = {}
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) er.email = 'Email chưa đúng định dạng'
      if (pw.length < 8) er.pw = 'Mật khẩu cần ít nhất 8 ký tự'
      setErr(er)
      if (!Object.keys(er).length) { setStep(2); toast({ title: 'Đã gửi mã xác minh', desc: `Kiểm tra hộp thư ${email} (bản demo: nhập 6 số bất kỳ)`, tone: 'info' }) }
      return
    }
    if (code.length < 6) { setErr({ code: 'Nhập đủ 6 chữ số' }); return }
    setBusy(true)
    setTimeout(() => { register({ username, email }); nav('/hoan-thien') }, 700)
  }
  const social = (name) => { if (!email) setEmail(`${username}@thu.vidu.vn`); toast({ title: `Bản demo: đăng ký bằng ${name} được mô phỏng`, tone: 'info' }); setBusy(true); setTimeout(() => { register({ username, email: email || `${username}@thu.vidu.vn` }); nav('/hoan-thien') }, 600) }

  return (
    <AuthShell
      topRight={<>Đã có tài khoản? <Link to="/dang-nhap" className="font-[600] text-fg underline underline-offset-4">Đăng nhập</Link></>}
      footer={<>
        <p className="ds-caption max-w-md">Khi tiếp tục, bạn đồng ý với điều khoản sử dụng và chính sách riêng tư (bản demo, không thu thập dữ liệu).</p>
        <div className="flex gap-2">
          {step > 0 && <Button onClick={() => { setStep(step - 1); setErr({}) }} disabled={busy}>Quay lại</Button>}
          <Button variant="primary" size="lg" onClick={next} loading={busy} disabled={step === 0 ? !nameState?.ok || checking : false}>{step === 2 ? 'Tạo trang' : 'Tiếp tục'}</Button>
        </div>
      </>}>
      <form onSubmit={next} className="animate-fade-in" key={step}>
        {step === 0 && (
          <>
            <h1 className="text-[26px] font-[750] tracking-tight">Tạo trang của bạn</h1>
            <p className="mt-1.5 text-[14.5px] text-muted">Chọn một tên cho địa chỉ trang. Bạn đổi được về sau.</p>
            <div className={cn('mt-6 flex h-13 items-center rounded-2xl border bg-subtle px-4 py-3 text-[16px] transition-colors', nameState ? (nameState.ok ? 'border-pos' : 'border-neg') : 'border-transparent focus-within:border-brand-400')}>
              <span className="font-[600]">{DOMAIN}/</span>
              <input autoFocus value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))} placeholder="tenban" aria-label="Tên trang" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint" />
              {username && (checking ? <Loader2 size={18} className="animate-spin text-faint" /> : nameState?.ok ? <CheckCircle2 size={19} className="text-pos" /> : <XCircle size={19} className="text-neg" />)}
            </div>
            <p className={cn('mt-2 min-h-5 text-[13px]', !nameState || checking ? 'text-muted' : nameState.ok ? 'text-pos' : 'text-neg')}>
              {!username ? 'Chỉ dùng chữ thường không dấu, số và gạch dưới.' : checking ? 'Đang kiểm tra…' : nameState.msg}
            </p>
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="text-[26px] font-[750] tracking-tight">Chào mừng, {username} 🌸</h1>
            <p className="mt-1.5 text-[14.5px] text-muted">Tạo tài khoản để giữ địa chỉ {DOMAIN}/{username}.</p>
            <div className="mt-6"><SocialButtons onPick={social} verb="Đăng ký" /></div>
            <Divider label="hoặc" className="my-5" />
            <div className="space-y-3">
              <Input size="lg" type="email" placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} error={err.email} autoComplete="email" />
              <Input size="lg" type={show ? 'text' : 'password'} placeholder="Mật khẩu" aria-label="Mật khẩu" value={pw} onChange={(e) => setPw(e.target.value)} error={err.pw} autoComplete="new-password"
                suffix={<button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="grid place-items-center">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>} />
              {pw && (
                <div>
                  <div className="flex gap-1">{[1, 2, 3, 4].map((k) => <span key={k} className={cn('h-1.5 flex-1 rounded-full', k <= s ? STRENGTH[s][1] : 'bg-line')} />)}</div>
                  <p className="mt-1.5 ds-caption">Độ mạnh mật khẩu: <b className="font-[600] text-fg">{STRENGTH[pw.length < 8 ? 0 : s][0]}</b>. Thêm chữ hoa, số hoặc ký hiệu để mạnh hơn.</p>
                </div>
              )}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-[26px] font-[750] tracking-tight">Kiểm tra hộp thư</h1>
            <p className="mt-1.5 text-[14.5px] text-muted">Chúng tôi vừa gửi mã 6 số tới <b className="font-[600] text-fg">{email}</b>.</p>
            <div className="mt-6"><OtpInput value={code} onChange={(v) => { setCode(v); setErr({}) }} /></div>
            {err.code && <p className="mt-2 text-[13px] text-neg">{err.code}</p>}
            <p className="mt-4 text-[13.5px] text-muted">Chưa nhận được? <button type="button" onClick={() => toast('Đã gửi lại mã')} className="font-[600] text-brand-ink hover:underline">Gửi lại mã</button></p>
            <p className="mt-6 rounded-2xl bg-brand-50 px-4 py-3 text-[13px] text-dim">Bản demo không gửi thư thật. Nhập 6 chữ số bất kỳ để tiếp tục.</p>
          </>
        )}
        <button type="submit" className="hidden" />
      </form>
    </AuthShell>
  )
}
