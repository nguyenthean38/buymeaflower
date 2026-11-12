import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Share2, Link2, QrCode as QrIcon, Heart, Crown, Store, Newspaper, Landmark, ArrowRight, ChevronDown, Lightbulb, MoreHorizontal, Eye } from 'lucide-react'
import { Avatar, Button, Popover, Menu, Modal, QrCode, Badge, Drawer, KeyValue, Callout } from '@/components/ui'
import { Flower } from '@/components/brand/Flower'
import { AreaChart, SplitBar } from '@/components/charts'
import { DashPage, Section } from '@/components/layout/DashPage'
import { formatVND, formatDateTime, timeAgo } from '@/lib/format'
import { DOMAIN } from '@/data/reference'
import { useApp, summarize, dailySeries, balanceOf, supporterCount, netOf } from '@/store'
import { copyText } from '@/features/support/SupportBox'

const PERIODS = [{ value: 7, label: '7 ngày qua' }, { value: 30, label: '30 ngày qua' }, { value: 90, label: '90 ngày qua' }, { value: 0, label: 'Toàn thời gian' }]
const TYPE = {
  flower: { label: 'Tặng hoa', tone: 'brand', color: 'var(--c-chart-1)' },
  membership: { label: 'Hội viên', tone: 'gold', color: 'var(--c-chart-3)' },
  shop: { label: 'Cửa hàng', tone: 'pos', color: 'var(--c-chart-2)' },
}

export default function HomePage() {
  const state = useApp()
  const { page, supports, membership, shop, posts, payout } = state
  const [days, setDays] = useState(30)
  const [qr, setQr] = useState(false)
  const [detail, setDetail] = useState(null)
  const sum = useMemo(() => summarize(supports, days), [supports, days])
  const series = useMemo(() => dailySeries(supports, days || 120), [supports, days])
  const url = `https://${DOMAIN}/${page.username}`
  const levelName = (id) => membership.levels.find((l) => l.id === id)?.name
  const itemName = (id) => shop.items.find((i) => i.id === id)?.name
  const describe = (s) => s.type === 'flower' ? `${s.qty} ${page.item.name} ${page.item.emoji}` : s.type === 'membership' ? `Hạng ${levelName(s.levelId) || 'hội viên'}` : itemName(s.itemId) || 'Sản phẩm'

  const ways = [
    !membership.enabled && { to: '/quan-ly/hoi-vien', icon: Crown, title: 'Bật hội viên', desc: 'Thu nhập đều đặn hằng tháng từ người hâm mộ thân thiết.', tone: 'bg-gold-soft text-gold' },
    shop.items.length === 0 && { to: '/quan-ly/cua-hang', icon: Store, title: 'Mở cửa hàng', desc: 'Bán tệp số, lịch hẹn hay tranh vẽ theo yêu cầu.', tone: 'bg-ice-soft text-ice' },
    posts.length === 0 && { to: '/quan-ly/bai-viet', icon: Newspaper, title: 'Đăng bài riêng', desc: 'Nội dung chỉ dành cho người ủng hộ và hội viên.', tone: 'bg-brand-50 text-brand-ink' },
    { to: '/quan-ly/nut-va-hinh', icon: QrIcon, title: 'Gắn nút lên trang web', desc: 'Nút tặng hoa, tiện ích nổi và mã QR để in.', tone: 'bg-info-soft text-info' },
    { to: '/quan-ly/gioi-thieu', icon: Heart, title: 'Mời bạn bè', desc: 'Nhận hoa hồng khi bạn của bạn mở trang.', tone: 'bg-brand-50 text-brand-ink' },
    membership.enabled && { to: '/quan-ly/bai-viet/moi?loai=text', icon: Newspaper, title: 'Viết bài cho hội viên', desc: 'Hội viên ở lại lâu hơn khi có bài mới mỗi tuần.', tone: 'bg-gold-soft text-gold' },
  ].filter(Boolean).slice(0, 3)

  return (
    <DashPage>
      {!payout.connected && (
        <Callout tone="warn" icon={Landmark} title="Chưa liên kết tài khoản nhận tiền" action={<Button size="sm" variant="inverse" to="/quan-ly/rut-tien">Thiết lập</Button>}>
          Trang của bạn đã nhận được ủng hộ, nhưng cần một tài khoản ngân hàng để rút tiền về.
        </Callout>
      )}

      <Section>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={page.name} color={page.avatarColor} size={56} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-[700] tracking-tight">Chào {page.name} <Flower size={18} className="inline -mt-1" spin /></h1>
            <Link to={`/${page.username}`} className="num text-[13.5px] text-muted hover:text-brand-ink">{DOMAIN}/{page.username}</Link>
          </div>
          <Button variant="outline" icon={Eye} to={`/${page.username}`} className="hidden sm:inline-flex">Xem trang</Button>
          <Popover align="end" width={210} trigger={(p) => <Button {...p} variant="inverse" icon={Share2}><span>Chia sẻ<span className="hidden sm:inline"> trang</span></span></Button>}>
            {(close) => <Menu onClose={close} items={[
              { label: 'Sao chép liên kết', icon: Link2, onClick: () => copyText(url, 'Đã sao chép liên kết trang') },
              { label: 'Lấy mã QR', icon: QrIcon, onClick: () => setQr(true) },
            ]} />}
          </Popover>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <div className="flex items-center gap-3">
            <h2 className="ds-h2">Thu nhập</h2>
            <Popover width={190} trigger={(p) => <button {...p} className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-[13px] font-[550] text-dim hover:bg-subtle">{PERIODS.find((x) => x.value === days).label}<ChevronDown size={14} /></button>}>
              {(close) => <Menu onClose={close} items={PERIODS.map((x) => ({ label: x.label, checked: x.value === days, onClick: () => setDays(x.value) }))} />}
            </Popover>
          </div>
          <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
            <div className="num text-[40px] font-[800] leading-none tracking-[-0.03em]">{formatVND(sum.total)}</div>
            <div className="pb-1 text-[13px] text-muted">{sum.count} lượt · thực nhận <b className="num font-[600] text-fg">{formatVND(netOf(sum.total))}</b> sau phí 5%</div>
          </div>
          <SplitBar className="mt-4" parts={[
            { label: 'Tặng hoa', value: sum.flower, color: TYPE.flower.color },
            { label: 'Hội viên', value: sum.membership, color: TYPE.membership.color },
            { label: 'Cửa hàng', value: sum.shop, color: TYPE.shop.color },
          ]} />
          <AreaChart data={series} height={190} className="mt-5" />
        </div>
      </Section>

      <div className="grid gap-5 sm:grid-cols-3">
        {[['Số dư có thể rút', formatVND(balanceOf(state)), '/quan-ly/rut-tien', 'Rút tiền'], ['Người ủng hộ', supporterCount(supports), '/quan-ly/ung-ho', 'Xem danh sách'], ['Hội viên đang hoạt động', membership.members.filter((m) => m.status !== 'paused').length, '/quan-ly/hoi-vien', 'Quản lý']].map(([l, v, to, cta]) => (
          <Link key={l} to={to} className="card group p-5 transition-shadow hover:shadow-md">
            <div className="text-[13px] text-muted">{l}</div>
            <div className="num mt-1 text-[24px] font-[750] tracking-tight">{v}</div>
            <div className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-[600] text-brand-ink">{cta}<ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" /></div>
          </Link>
        ))}
      </div>

      <Section title="Gần đây" action={supports.length > 0 && <Button size="sm" variant="ghost" to="/quan-ly/ung-ho" iconRight={ArrowRight}>Tất cả</Button>}>
        {supports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
            <Heart size={24} className="mx-auto text-brand-400" />
            <div className="mt-2 text-[15px] font-[650]">Bạn chưa có người ủng hộ nào</div>
            <p className="mx-auto mt-1 max-w-sm text-[13.5px] text-muted">Chia sẻ trang với khán giả của bạn để nhận bông hoa đầu tiên.</p>
            <Button className="mt-4" variant="primary" icon={Link2} onClick={() => copyText(url, 'Đã sao chép liên kết trang')}>Sao chép liên kết trang</Button>
          </div>
        ) : (
          <ul className="-my-1 divide-y divide-line">
            {supports.slice(0, 7).map((s) => (
              <li key={s.id}>
                <button onClick={() => setDetail(s)} className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-subtle">
                  <Avatar name={s.name} color={s.avatarColor} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-[600]">{s.name}</div>
                    <div className="truncate text-[12.5px] text-muted">{s.message || describe(s)}</div>
                  </div>
                  <Badge tone={TYPE[s.type].tone} className="hidden sm:inline-flex">{describe(s)}</Badge>
                  <div className="w-24 shrink-0 text-right"><div className="num text-[14px] font-[650]">{formatVND(s.amount)}</div><div className="text-[12px] text-faint">{timeAgo(s.at)}</div></div>
                  <MoreHorizontal size={16} className="hidden shrink-0 text-faint sm:block" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div>
        <h2 className="mb-3 flex items-center gap-2 ds-h2"><Lightbulb size={18} className="text-gold" /> Thêm cách kiếm tiền</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {ways.map((w) => (
            <Link key={w.title} to={w.to} className="card group p-5 transition-shadow hover:shadow-md">
              <span className={`grid size-10 place-items-center rounded-2xl ${w.tone}`}><w.icon size={19} /></span>
              <div className="mt-3 text-[15px] font-[650] group-hover:text-brand-ink">{w.title}</div>
              <p className="mt-1 text-[13px] text-muted">{w.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <Modal open={qr} onClose={() => setQr(false)} title="Mã QR của trang" desc="Người hâm mộ quét mã để mở trang và tặng hoa không cần gõ địa chỉ." size="sm">
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="relative rounded-2xl border border-line bg-white p-4 text-[#2b1622]">
            <QrCode value={url} size={190} />
            <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white"><Flower size={30} /></span>
          </div>
          <div className="num text-[13.5px] text-muted">{DOMAIN}/{page.username}</div>
          <div className="flex gap-2"><Button onClick={() => copyText(url, 'Đã sao chép liên kết trang')}>Sao chép liên kết</Button><Button variant="primary" to="/quan-ly/nut-va-hinh">Tải mã QR</Button></div>
        </div>
      </Modal>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title="Chi tiết giao dịch">
        {detail && (
          <>
            <div className="flex items-center gap-3">
              <Avatar name={detail.name} color={detail.avatarColor} size={48} />
              <div className="min-w-0"><div className="text-[16px] font-[650]">{detail.name}</div><div className="truncate text-[13px] text-muted">{detail.email || 'Không để lại email'}</div></div>
            </div>
            {detail.message && <p className="mt-4 rounded-2xl bg-subtle px-4 py-3 text-[14px] text-dim">“{detail.message}”</p>}
            <KeyValue className="mt-4" items={[
              { label: 'Loại', value: TYPE[detail.type].label },
              { label: 'Nội dung', value: describe(detail) },
              { label: 'Số tiền', value: formatVND(detail.amount) },
              { label: 'Phí nền tảng (5%)', value: '−' + formatVND(detail.amount - netOf(detail.amount)) },
              { label: 'Thực nhận', value: <b className="font-[650]">{formatVND(netOf(detail.amount))}</b> },
              { label: 'Thời gian', value: formatDateTime(detail.at) },
              { label: 'Mã giao dịch', value: <span className="font-mono text-[12.5px]">{detail.id.toUpperCase()}</span> },
            ]} />
          </>
        )}
      </Drawer>
    </DashPage>
  )
}
