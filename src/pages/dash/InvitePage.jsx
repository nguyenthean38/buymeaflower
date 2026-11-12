import { useState } from 'react'
import { ArrowRight, Coins, History, Mail, MessageSquareQuote, Share2, Sprout, UserCheck, UserPlus, Users } from 'lucide-react'
import { DashPage, Section, StatTile } from '@/components/layout/DashPage'
import { Avatar, Badge, Button, EmptyState, Modal, Money, Table, THead, Th, Tr, Td } from '@/components/ui'
import { Flower } from '@/components/brand/Flower'
import { useApp, toast, uid, nowISO } from '@/store'
import { DOMAIN, AVATAR_COLORS } from '@/data/reference'
import { formatDate, formatDay, formatVND } from '@/lib/format'
import { CopyField, copyText } from '@/features/thietlap/shared'

const STEPS = [
  { icon: Share2, title: 'Chia sẻ liên kết', desc: 'Gửi liên kết mời cho bạn bè cũng đang sáng tạo nội dung.' },
  { icon: Sprout, title: 'Bạn của bạn mở trang và nhận ủng hộ', desc: 'Họ đăng ký qua liên kết của bạn rồi bắt đầu nhận hoa.' },
  { icon: Coins, title: 'Bạn nhận 5% phí nền tảng của họ trong 12 tháng', desc: 'Hoa hồng trích từ phần phí của chúng tôi, bạn của bạn không mất gì.' },
]
const TIPS = [
  { title: 'Kể câu chuyện của chính bạn', desc: 'Một dòng về việc trang tặng hoa đã giúp bạn thế nào thuyết phục hơn mọi lời quảng cáo.' },
  { title: 'Gửi riêng cho từng người', desc: 'Nhắn trực tiếp cho vài người bạn làm sáng tạo hiệu quả hơn đăng một bài chung chung.' },
  { title: 'Đặt liên kết ở nơi dễ thấy', desc: 'Thêm liên kết mời vào phần giới thiệu trên mạng xã hội, cuối thư tin tức hoặc mô tả video.' },
  { title: 'Giúp bạn mình có khởi đầu tốt', desc: 'Tặng họ bông hoa đầu tiên và chia sẻ trang của họ. Trang càng sôi nổi, hoa hồng của bạn càng đều.' },
]

function PayoutModal({ onClose }) {
  const invites = useApp((s) => s.invites)
  const mutate = useApp((s) => s.mutate)
  const [loading, setLoading] = useState(false)
  const earned = invites.referred.reduce((a, r) => a + (r.earned || 0), 0)
  const pending = Math.max(0, earned - (invites.paid || 0))
  const payouts = invites.payouts || []

  const transfer = () => {
    setLoading(true)
    setTimeout(() => {
      mutate((d) => {
        d.invites.paid = (d.invites.paid || 0) + pending
        d.invites.payouts = [{ id: uid('hh'), amount: pending, at: nowISO() }, ...(d.invites.payouts || [])]
      })
      setLoading(false)
      toast({ title: 'Đã chuyển hoa hồng vào số dư', desc: `${formatVND(pending)} đã được ghi nhận.` })
    }, 700)
  }

  return (
    <Modal open onClose={loading ? undefined : onClose} title="Lịch sử chi trả" desc="Hoa hồng được cộng dồn mỗi khi người bạn mời nhận ủng hộ."
      footer={<Button variant="secondary" disabled={loading} onClick={onClose}>Đóng</Button>}>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-subtle p-4">
        <div>
          <div className="ds-caption">Số dư hoa hồng</div>
          <div className="mt-0.5 text-[26px] font-[650] leading-tight tracking-tight"><Money value={pending} hideable={false} /></div>
          <div className="ds-caption mt-1">Đã chuyển trước đó: {formatVND(invites.paid || 0)}</div>
        </div>
        <Button variant="primary" loading={loading} disabled={pending <= 0} onClick={transfer}>Chuyển vào số dư</Button>
      </div>

      <div className="ds-label mb-1 mt-5">Các lần đã chuyển</div>
      {payouts.length ? (
        <ul className="divide-y divide-line">
          {payouts.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-[13.5px]">
              <span className="num text-muted">{formatDate(p.at)}</span>
              <span className="flex items-center gap-2.5"><span className="num font-[600]">{formatVND(p.amount)}</span><Badge tone="pos" size="sm">Đã chuyển</Badge></span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-[13.5px] text-muted">{pending > 0 ? 'Bạn chưa chuyển hoa hồng lần nào.' : 'Chưa có hoa hồng để chuyển. Hãy mời thêm bạn bè nhé.'}</p>
      )}
    </Modal>
  )
}

export default function InvitePage() {
  const invites = useApp((s) => s.invites)
  const name = useApp((s) => s.page.name)
  const [historyOpen, setHistoryOpen] = useState(false)

  const link = `https://${DOMAIN}/?moi=${invites.code}`
  const referred = invites.referred
  const active = referred.filter((r) => r.active).length
  const earned = referred.reduce((a, r) => a + (r.earned || 0), 0)
  const message = `Chào bạn, mình đang dùng Buy Me a Flower để nhận ủng hộ từ người hâm mộ: tặng hoa, hội viên hằng tháng, bán sản phẩm số đều có. Mở trang chỉ mất vài phút, bạn thử qua liên kết của mình nhé: ${link}\n\n${name}`
  const mailto = `mailto:?subject=${encodeURIComponent('Mời bạn mở trang trên Buy Me a Flower')}&body=${encodeURIComponent(message)}`

  return (
    <DashPage title="Giới thiệu bạn" desc="Rủ thêm bạn bè làm sáng tạo cùng dùng Buy Me a Flower và nhận hoa hồng."
      actions={<Button variant="outline" icon={History} onClick={() => setHistoryOpen(true)}>Lịch sử chi trả</Button>}>
      <section className="card relative overflow-hidden p-5 sm:p-7">
        <Flower size={170} color="var(--c-brand-100)" center="var(--c-brand-200)" className="pointer-events-none absolute -right-12 -top-14" />
        <div className="relative">
          <Badge tone="brand" icon={UserPlus}>Chương trình giới thiệu</Badge>
          <h2 className="mt-3 text-[24px] font-[750] leading-tight tracking-tight">Mời bạn bè, nhận hoa hồng</h2>
          <p className="mt-1.5 max-w-lg text-[14px] text-muted">Mỗi nhà sáng tạo mở trang qua liên kết của bạn sẽ mang về cho bạn một phần phí nền tảng của họ suốt một năm.</p>

          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl bg-subtle p-4">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-surface text-brand-ink"><s.icon size={19} /></span>
                  <span className="num text-[12px] font-[650] text-faint">Bước {i + 1}</span>
                </div>
                <div className="mt-3 text-[14px] font-[600] leading-snug">{s.title}</div>
                <p className="ds-caption mt-1">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <span className="absolute -right-[13px] top-1/2 z-10 hidden size-6 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-faint sm:grid"><ArrowRight size={13} /></span>
                )}
              </li>
            ))}
          </ol>

          <CopyField className="mt-6" label="Liên kết mời của bạn" value={link} message="Đã sao chép liên kết mời" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" icon={Mail} href={mailto} target="_self">Gửi qua email</Button>
            <Button variant="secondary" size="sm" icon={MessageSquareQuote} onClick={() => copyText(message, 'Đã sao chép lời mời soạn sẵn')}>Sao chép lời mời soạn sẵn</Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile className="bg-surface border border-line" label="Người đã mời" value={referred.length} icon={Users} />
        <StatTile className="bg-surface border border-line" label="Đang hoạt động" value={active} icon={UserCheck} />
        <StatTile className="bg-surface border border-line" label="Hoa hồng đã nhận" value={formatVND(earned)} icon={Coins} />
      </div>

      <Section title="Nhà sáng tạo tôi đã mời" padded={false}>
        {referred.length ? (
          <Table minWidth={520} className="mt-3 pb-2">
            <THead><Th>Nhà sáng tạo</Th><Th>Ngày tham gia</Th><Th>Trạng thái</Th><Th align="right">Hoa hồng</Th></THead>
            <tbody>
              {referred.map((r, i) => (
                <Tr key={r.id || r.username}>
                  <Td>
                    <div className="flex items-center gap-3 py-2">
                      <Avatar name={r.name} color={AVATAR_COLORS[(i + 2) % AVATAR_COLORS.length]} size={34} />
                      <div className="min-w-0">
                        <div className="truncate font-[550]">{r.name}</div>
                        <div className="truncate text-[12.5px] text-muted">{DOMAIN}/{r.username}</div>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-muted">{formatDay(r.joined, { year: true })}</Td>
                  <Td>{r.active ? <Badge tone="pos" dot>Đang hoạt động</Badge> : <Badge dot>Chưa nhận ủng hộ</Badge>}</Td>
                  <Td align="right" className="font-[600]"><Money value={r.earned || 0} /></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon={UserPlus} title="Bạn chưa mời ai" desc="Chia sẻ liên kết mời ở trên. Khi có người mở trang qua liên kết đó, họ sẽ hiện ở đây."
            action={<Button variant="primary" onClick={() => copyText(link, 'Đã sao chép liên kết mời')}>Sao chép liên kết mời</Button>} />
        )}
      </Section>

      <Section title="Mẹo quảng bá">
        <ol className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {TIPS.map((t, i) => (
            <li key={t.title} className="flex gap-3.5">
              <span className="num grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-[13px] font-[700] text-brand-ink">{i + 1}</span>
              <div className="min-w-0">
                <div className="text-[14px] font-[600]">{t.title}</div>
                <p className="mt-0.5 text-[13.5px] text-muted">{t.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {historyOpen && <PayoutModal onClose={() => setHistoryOpen(false)} />}
    </DashPage>
  )
}
