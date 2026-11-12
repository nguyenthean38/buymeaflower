import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { toast } from '@/store'
import { CenterShell } from '@/features/public/AuthShell'

export default function ResetPage() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') || 'ban@thu.vidu.vn'
  const [pw, setPw] = useState('')
  const [again, setAgain] = useState('')
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (pw.length < 8) er.pw = 'Mật khẩu cần ít nhất 8 ký tự'
    if (again !== pw) er.again = 'Hai mật khẩu chưa khớp'
    setErr(er)
    if (Object.keys(er).length) return
    setBusy(true)
    setTimeout(() => { toast('Đã đặt lại mật khẩu. Mời bạn đăng nhập.'); nav('/dang-nhap') }, 700)
  }
  return (
    <CenterShell topRight={<Link to="/dang-nhap" className="font-[600] text-fg underline underline-offset-4">Quay lại đăng nhập</Link>}>
      <form onSubmit={submit}>
        <h1 className="text-center text-[28px] font-[800] tracking-tight">Đặt lại mật khẩu</h1>
        <p className="mt-1.5 text-center text-[14.5px] text-muted">Chọn một mật khẩu mới cho tài khoản.</p>
        <div className="mt-7 space-y-3">
          <Input size="lg" value={email} disabled aria-label="Email" />
          <Input size="lg" type="password" autoFocus placeholder="Mật khẩu mới" aria-label="Mật khẩu mới" value={pw} onChange={(e) => setPw(e.target.value)} error={err.pw} autoComplete="new-password" />
          <Input size="lg" type="password" placeholder="Nhập lại mật khẩu" aria-label="Nhập lại mật khẩu" value={again} onChange={(e) => setAgain(e.target.value)} error={err.again} autoComplete="new-password" />
        </div>
        <Button type="submit" variant="primary" size="lg" className="mt-4 w-full" loading={busy}>Đặt lại mật khẩu</Button>
      </form>
    </CenterShell>
  )
}
