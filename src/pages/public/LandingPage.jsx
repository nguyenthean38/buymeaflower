import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Heart, Star, Check, ChevronDown, Landmark, Percent, Users, Smartphone, ShieldCheck, Zap, ArrowRight, Crown, Lock, Download } from 'lucide-react'
import { Avatar, Button, Badge } from '@/components/ui'
import { Flower, FlowerArt } from '@/components/brand/Flower'
import { cn } from '@/lib/cn'
import { formatNumber, formatVND } from '@/lib/format'
import { CREATORS } from '@/data/creators'
import { useApp, resolveCreator } from '@/store'
import { PublicNav, PublicFooter, ClaimInput } from '@/features/public/PublicChrome'
import { SupportBox } from '@/features/support/SupportBox'

const FLOAT = [
  { i: 0, cls: 'left-[1%] top-[4%] -rotate-6', d: '0s' },
  { i: 1, cls: 'left-[7%] top-[36%] rotate-3', d: '1.2s' },
  { i: 2, cls: 'left-[0%] top-[68%] -rotate-3', d: '2.1s' },
  { i: 3, cls: 'right-[2%] top-[2%] rotate-6', d: '.6s' },
  { i: 4, cls: 'right-[8%] top-[35%] -rotate-3', d: '1.8s' },
  { i: 5, cls: 'right-[1%] top-[67%] rotate-3', d: '2.7s' },
]

function FloatCard({ c, cls, d }) {
  const { page } = c
  return (
    <Link to={`/${page.username}`} className={cn('absolute hidden w-[200px] xl:block', cls)}>
      <div className="animate-float rounded-3xl border border-line bg-surface px-4 py-5 text-center shadow-md transition-shadow hover:shadow-lg" style={{ animationDelay: d }}>
        <Avatar name={page.name} color={page.avatarColor} size={52} className="mx-auto" />
        <p className="mt-2.5 text-[14px] leading-snug"><b className="font-[650]">{page.name}</b> {page.tagline}</p>
        <p className="mt-2 inline-flex items-center gap-1 text-[12.5px] text-muted"><Heart size={13} /> {formatNumber(c.supporterCount)} người ủng hộ</p>
      </div>
    </Link>
  )
}

function SectionHead({ eyebrow, title, desc }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="ds-label text-brand-ink">{eyebrow}</div>
      <h2 className="mt-3 text-[30px] font-[800] leading-[1.12] tracking-[-0.03em] sm:text-[42px]">{title}</h2>
      <p className="mt-4 text-[16px] leading-relaxed text-dim sm:text-[17px]">{desc}</p>
    </div>
  )
}

const FEATURES = [
  { icon: Percent, title: 'Không phí hằng tháng', desc: 'Chỉ thu 5% khi bạn nhận được ủng hộ. Chưa có ai tặng thì chưa mất đồng nào.' },
  { icon: Landmark, title: 'Tiền về thẳng ngân hàng', desc: 'Liên kết tài khoản một lần, tiền chuyển về hằng tuần hoặc rút bất cứ lúc nào.' },
  { icon: Smartphone, title: 'Quét mã là tặng', desc: 'Người hâm mộ quét mã QR, dùng ví điện tử hoặc thẻ. Không cần tạo tài khoản.' },
  { icon: Users, title: 'Người ủng hộ là của bạn', desc: 'Bạn giữ danh sách, nhắn tin trực tiếp, xuất tệp bất cứ khi nào cần.' },
  { icon: ShieldCheck, title: 'Riêng tư theo ý bạn', desc: 'Bài viết công khai, cho người ủng hộ hoặc chỉ hội viên — bạn chọn cho từng bài.' },
  { icon: Zap, title: 'Gắn vào mọi nơi', desc: 'Nút cho trang web, tiện ích nổi, thông báo khi phát trực tiếp, mã QR để in.' },
]

const FAQ = [
  ['Buy Me a Flower là gì?', 'Là một trang cá nhân nơi khán giả có thể tặng bạn “một bông hoa” — tức một khoản tiền nhỏ — để cảm ơn những gì bạn làm ra. Bạn cũng có thể mở hội viên hằng tháng, bán sản phẩm số và đăng bài riêng cho người ủng hộ.'],
  ['Tôi có phải trả phí để tạo trang không?', 'Không. Tạo trang miễn phí và không có phí duy trì. Nền tảng giữ 5% trên mỗi khoản ủng hộ; phần còn lại là của bạn.'],
  ['Người ủng hộ thanh toán bằng cách nào?', 'Bằng mã QR chuyển khoản, ví điện tử hoặc thẻ. Họ không cần đăng ký tài khoản, chỉ cần chọn số hoa và bấm tặng.'],
  ['Một bông hoa giá bao nhiêu?', 'Do bạn quyết định, mặc định là 20.000 ₫. Bạn còn có thể đổi “bông hoa” thành ly trà sữa, cuốn sách hay bất cứ thứ gì hợp với mình.'],
  ['Khi nào tôi nhận được tiền?', 'Sau khi liên kết tài khoản ngân hàng, bạn chọn nhận tự động hằng tuần, hằng tháng hoặc tự rút khi số dư từ 50.000 ₫.'],
  ['Đây có phải dịch vụ thật không?', 'Chưa. Đây là bản demo giao diện do Ntahien Tech thiết kế và lập trình. Mọi dữ liệu, nhà sáng tạo và giao dịch trên trang đều là mô phỏng, không có tiền thật nào được chuyển.'],
]

export default function LandingPage() {
  const state = useApp()
  const demo = useMemo(() => resolveCreator(state, state.page.username), [state])
  const { hash } = useLocation()
  const [open, setOpen] = useState(0)
  useEffect(() => { if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }) }, [hash])

  return (
    <div className="bg-canvas">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-[1440px] px-4 pb-20 pt-12 sm:pt-20 xl:min-h-[680px]">
          {FLOAT.map((f) => <FloatCard key={f.i} c={CREATORS[f.i]} cls={f.cls} d={f.d} />)}
          <div className="relative mx-auto flex max-w-[760px] flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-dim shadow-xs">
              <span className="flex text-gold">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} className="fill-current" />)}</span>
              Dành cho nhà sáng tạo Việt
            </div>
            <h1 className="ds-display mt-6">Lời cảm ơn<br />nở thành <span className="relative inline-block text-crystal">hoa<Flower size={34} kind="mai" spin className="absolute -right-9 -top-2 hidden sm:block" /></span></h1>
            <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-dim sm:text-[19px]">Nhận ủng hộ từ khán giả, mở hội viên hằng tháng, bán sản phẩm số. Dễ hơn bạn nghĩ, và tính bằng tiền đồng.</p>
            <ClaimInput className="mt-8" />
            <p className="mt-4 text-[13.5px] text-muted">Miễn phí, mất chưa tới một phút. <Link to="/quan-ly?demo=1" className="font-[600] text-brand-ink underline-offset-4 hover:underline">Hoặc xem thử bản demo →</Link></p>
          </div>
        </div>
      </section>

      {/* Tặng hoa */}
      <section id="cach-hoat-dong" className="scroll-mt-20 bg-side py-20 sm:py-28">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <SectionHead eyebrow="Tặng hoa" title="Cho khán giả một cách dễ thương để nói cảm ơn" desc="Chỉ vài chạm, người hâm mộ đã gửi được cho bạn một bó hoa kèm lời nhắn. Họ không cần tạo tài khoản." />
          <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <ul className="space-y-6">
                {[['Chọn số hoa', 'Một, ba, năm bông hay một con số bất kỳ. Giá mỗi bông do bạn đặt.'], ['Nhắn đôi lời', 'Lời nhắn hiện trên trang của bạn, hoặc chỉ mình bạn đọc được.'], ['Quét mã, xong', 'Thanh toán bằng mã QR, ví điện tử hoặc thẻ. Bạn nhận thông báo ngay.']].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="num grid size-10 shrink-0 place-items-center rounded-full bg-brand-500 text-[16px] font-[750] text-white">{i + 1}</span>
                    <div><h3 className="text-[18px] font-[700] tracking-tight">{t}</h3><p className="mt-1 text-[15px] text-dim">{d}</p></div>
                  </li>
                ))}
              </ul>
              <p className="mt-8 rounded-2xl border border-dashed border-brand-300 bg-brand-50 px-4 py-3 text-[14px] text-dim">👉 Ô bên cạnh là ô tặng hoa thật của trang demo <Link to={`/${demo.page.username}`} className="font-[650] text-brand-ink hover:underline">{demo.page.name}</Link>. Bấm thử đi, không mất tiền đâu.</p>
            </div>
            <div className="order-1 mx-auto w-full max-w-[420px] lg:order-2" style={{ '--page': demo.page.themeColor }}>
              <SupportBox creator={demo} className="shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Hội viên */}
      <section id="hoi-vien" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <SectionHead eyebrow="Hội viên" title="Thu nhập đều đặn từ những người thương bạn nhất" desc="Mở các hạng hội viên theo tháng hoặc theo năm. Hội viên nhận bài viết riêng, hậu trường, quà tặng — bạn nhận sự yên tâm để làm việc dài hơi." />
          <div className="mx-auto mt-12 grid max-w-[880px] gap-5 sm:grid-cols-3">
            {[{ name: 'Nụ', price: 30000, art: 11, r: ['Bài viết riêng', 'Bản nháp đang làm dở'] }, { name: 'Hoa', price: 79000, art: 12, r: ['Mọi quyền lợi hạng Nụ', 'Hình nền mỗi tháng', 'Video hậu trường'], hot: true }, { name: 'Vườn', price: 199000, art: 13, r: ['Mọi quyền lợi hạng Hoa', 'Thiệp vẽ tay gửi về nhà', 'Nêu tên trong sách'] }].map((l) => (
              <div key={l.name} className={cn('card relative flex flex-col overflow-hidden rounded-3xl', l.hot && 'ring-2 ring-brand-400 sm:-translate-y-3 shadow-md')}>
                {l.hot && <Badge tone="brand" className="absolute right-3 top-3 z-10 bg-surface">Được chọn nhiều</Badge>}
                <FlowerArt seed={l.art} variant="bouquet" className="h-24 w-full" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-1.5 text-[17px] font-[700]"><Crown size={16} className="text-brand-500" />{l.name}</div>
                  <div className="mt-1"><span className="num text-[24px] font-[800] tracking-tight">{formatVND(l.price)}</span><span className="text-[13px] text-muted"> / tháng</span></div>
                  <ul className="mt-4 space-y-2">{l.r.map((x) => <li key={x} className="flex gap-2 text-[13.5px] text-dim"><Check size={16} className="mt-0.5 shrink-0 text-ice" />{x}</li>)}</ul>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center"><Button variant="outline" size="lg" to={`/${demo.page.username}?tab=hoi-vien`} iconRight={ArrowRight}>Xem trang hội viên mẫu</Button></div>
        </div>
      </section>

      {/* Cửa hàng */}
      <section id="cua-hang" className="scroll-mt-20 bg-side py-20 sm:py-28">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <SectionHead eyebrow="Cửa hàng" title="Bán một thứ gì đó chỉ trong vài phút" desc="Sách điện tử, hình nền, bộ cọ, buổi trò chuyện 1:1, vé lớp học trực tuyến hay một bức vẽ theo yêu cầu. Không cần dựng cả một website bán hàng." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[['Bộ hình nền “Mùa hoa”', 49000, 21, 'Tệp tải về', Download], ['Vẽ chân dung màu nước', 450000, 22, 'Đặt vẽ', Heart], ['Buổi vẽ chung trực tuyến', 99000, 23, 'Vé sự kiện', Users], ['Hậu trường sách tranh', 0, 24, 'Chỉ hội viên', Lock]].map(([n, p, art, kind, Icon]) => (
              <div key={n} className="card overflow-hidden rounded-3xl">
                <div className="relative"><FlowerArt seed={art} className="aspect-[4/3] w-full" /><Badge icon={Icon} className="absolute left-3 top-3 bg-surface/90 backdrop-blur">{kind}</Badge></div>
                <div className="p-4"><h3 className="text-[15px] font-[650] leading-snug">{n}</h3><div className="num mt-1 text-[15px] font-[700]">{p ? formatVND(p) : 'Tuỳ tâm'}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tính năng */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <SectionHead eyebrow="Vì sao chọn chúng tôi" title="Làm cho người sáng tạo, không phải cho doanh nghiệp" desc="Bạn không cần hiểu về cổng thanh toán hay viết một dòng mã nào. Mọi thứ có sẵn và nói tiếng Việt." />
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-ink"><f.icon size={20} /></span>
                <div><h3 className="text-[16.5px] font-[700] tracking-tight">{f.title}</h3><p className="mt-1 text-[14.5px] leading-relaxed text-dim">{f.desc}</p></div>
              </div>
            ))}
          </div>

          <div className="mt-20">
            <div className="flex items-end justify-between gap-4">
              <h3 className="text-[24px] font-[800] tracking-tight">Họ đang nhận hoa mỗi ngày</h3>
              <Link to="/kham-pha" className="shrink-0 text-[14px] font-[600] text-brand-ink hover:underline">Xem tất cả →</Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CREATORS.slice(0, 4).map((c) => (
                <Link key={c.page.username} to={`/${c.page.username}`} className="card group overflow-hidden rounded-3xl transition-shadow hover:shadow-md">
                  <FlowerArt seed={c.page.cover.seed} className="h-20 w-full" />
                  <div className="-mt-7 px-4 pb-4">
                    <Avatar name={c.page.name} color={c.page.avatarColor} size={52} className="ring-4 ring-surface" />
                    <div className="mt-2 text-[15px] font-[650] group-hover:text-brand-ink">{c.page.name}</div>
                    <p className="line-clamp-2 text-[13px] text-muted">{c.page.tagline}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-[12.5px] text-dim"><Heart size={13} className="fill-brand-400 text-brand-400" /> {formatNumber(c.supporterCount)} người ủng hộ</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hỏi đáp */}
      <section id="hoi-dap" className="scroll-mt-20 bg-side py-20 sm:py-28">
        <div className="mx-auto max-w-[760px] px-4 sm:px-6">
          <SectionHead eyebrow="Hỏi đáp" title="Những điều hay được hỏi" desc="Chưa thấy câu trả lời? Mở bản demo và tự tay thử mọi thứ." />
          <div className="mt-10 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
            {FAQ.map(([q, a], i) => (
              <div key={q}>
                <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15.5px] font-[620] hover:bg-subtle sm:px-6">
                  {q}<ChevronDown size={18} className={cn('shrink-0 text-muted transition-transform', open === i && 'rotate-180')} />
                </button>
                {open === i && <p className="animate-fade-in px-5 pb-5 text-[14.5px] leading-relaxed text-dim sm:px-6">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kêu gọi */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <Flower kind="dao" size={220} className="absolute -left-16 -top-10 opacity-15" spin />
        <Flower kind="huongduong" size={260} className="absolute -bottom-20 -right-16 opacity-15" spin />
        <div className="relative mx-auto flex max-w-[720px] flex-col items-center px-4 text-center">
          <h2 className="text-[34px] font-[800] leading-[1.1] tracking-[-0.03em] sm:text-[48px]">Một người ủng hộ quý hơn nghìn lượt theo dõi</h2>
          <p className="mt-4 text-[17px] text-dim">Tạo trang hôm nay, gắn liên kết vào phần giới thiệu của bạn, và để những người yêu quý bạn làm phần còn lại.</p>
          <ClaimInput className="mt-8" />
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
