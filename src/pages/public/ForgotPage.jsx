import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { CenterShell } from '@/features/public/AuthShell'

export default function ForgotPage() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') || '')
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Email chưa đúng định dạng'); return }
    setBusy(true); setTimeout(() => { setBusy(false); setSent(true) }, 700)
  }
  return (
    <CenterShell topRight={<Link to="/dang-nhap" className="font-[600] text-fg underline underline-offset-4">Quay lại đăng nhập</Link>}>
      {sent ? (
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-pos-soft text-pos"><MailCheck size={26} /></span>
          <h1 className="mt-4 text-[26px] font-[800] tracking-tight">Kiểm tra hộp thư</h1>
          <p className="mt-2 text-[14.5px] text-muted">Nếu có tài khoản dùng <b className="font-[600] text-fg">{email}</b>, bạn sẽ nhận được liên kết đặt lại mật khẩu trong ít phút.</p>
          <p className="mt-5 rounded-2xl bg-brand-50 px-4 py-3 text-[13px] text-dim">Bản demo không gửi thư thật. Bấm nút dưới để mở thẳng trang đặt lại mật khẩu.</p>
          <Button variant="primary" size="lg" className="mt-4 w-full" to={`/dat-lai-mat-khau?email=${encodeURIComponent(email)}`}>Mở liên kết đặt lại</Button>
          <button onClick={() => setSent(false)} className="mt-3 text-[13.5px] text-muted hover:text-fg">Dùng email khác</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <h1 className="text-center text-[28px] font-[800] tracking-tight">Quên mật khẩu?</h1>
          <p className="mt-1.5 text-center text-[14.5px] text-muted">Nhập email đăng ký, chúng tôi sẽ gửi liên kết đặt lại.</p>
          <Input size="lg" type="email" autoFocus className="mt-7" placeholder="Email" aria-label="Email" value={email} onChange={(e) => { setEmail(e.target.value); setErr('') }} error={err} />
          <Button type="submit" variant="primary" size="lg" className="mt-3 w-full" loading={busy}>Gửi liên kết đặt lại</Button>
        </form>
      )}
    </CenterShell>
  )
}
