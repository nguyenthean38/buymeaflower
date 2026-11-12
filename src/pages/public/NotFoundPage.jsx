import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { Logo } from '@/components/brand/Logo'
import { Flower } from '@/components/brand/Flower'
import { DOMAIN } from '@/data/reference'

/** Trang 404 — cũng dùng khi mở một tên trang chưa ai đăng ký. */
export default function NotFoundPage({ what }) {
  const { username } = useParams()
  const free = what === 'trang' && username && /^[a-z0-9_]{3,20}$/.test(username)
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <div className="relative mx-auto mb-6 w-fit">
          <Flower kind="cuc" size={92} color="var(--c-line-strong)" center="var(--c-faint)" className="rotate-12 opacity-80" />
          <span className="absolute -bottom-2 -right-8 text-[15px] font-[800] text-faint num">404</span>
        </div>
        <h1 className="text-[26px] font-[750] tracking-tight">{free ? 'Tên trang này còn trống' : `Không tìm thấy ${what || 'trang'} này`}</h1>
        <p className="mt-2 text-[14.5px] text-muted">
          {free ? <>Chưa ai dùng <b className="font-[600] text-fg">{DOMAIN}/{username}</b>. Bạn có muốn lấy tên này cho trang của mình?</> : 'Có thể đường dẫn đã đổi, hoặc bông hoa này chưa kịp nở.'}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          {free && <Button variant="primary" size="lg" to={`/dang-ky?ten=${username}`}>Lấy tên này</Button>}
          <Button size="lg" variant={free ? 'secondary' : 'primary'} to="/">Về trang chủ</Button>
          {!free && <Button size="lg" to="/kham-pha">Khám phá</Button>}
        </div>
        <div className="mt-10 flex justify-center"><Logo size={22} /></div>
      </div>
    </div>
  )
}
