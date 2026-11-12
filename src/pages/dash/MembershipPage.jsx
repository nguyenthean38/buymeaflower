import { useMemo, useState } from 'react'
import { CalendarClock, Download, ExternalLink, Lock, Pencil, Plus, Repeat, Sparkles, UserMinus, Users, Wallet } from 'lucide-react'
import { DashPage, Section, StatTile } from '@/components/layout/DashPage'
import { Avatar, Badge, Button, Confirm, EmptyState, KeyValue, Modal, SearchInput, Segmented, Select, Table, THead, Th, Tr, Td } from '@/components/ui'
import { Flower, FlowerArt } from '@/components/brand/Flower'
import { AreaChart } from '@/components/charts'
import { useApp, toast, uid, dailySeries, summarize } from '@/store'
import { DOMAIN, REWARD_TEMPLATES } from '@/data/reference'
import { formatDate, formatNumber, formatVND } from '@/lib/format'
import { CopyLink, Person, Toolbar, downloadCsv, matches, randomArt } from '@/features/kiemtien/shared'
import { LevelCard, LevelEditor } from '@/features/kiemtien/LevelEditor'
import { MembershipSettings, pauseUntil } from '@/features/kiemtien/MembershipSettings'

const isMembership = (s) => s.type === 'membership'
const SUPPORT_LABEL = { flower: 'Tặng hoa', membership: 'Phí hội viên', shop: 'Mua sản phẩm' }

function statusOf(member, paused) {
  if (member.status === 'gift') return { key: 'gift', label: 'Được tặng', tone: 'gold' }
  if (member.status === 'paused' || pauseUntil(paused, member.levelId)) return { key: 'paused', label: 'Tạm dừng', tone: 'warn' }
  return { key: 'active', label: 'Đang hoạt động', tone: 'pos' }
}

export default function MembershipPage() {
  const enabled = useApp((s) => s.membership.enabled)
  const memberCount = useApp((s) => s.membership.members.length)
  const levelCount = useApp((s) => s.membership.levels.length)
  const [tab, setTab] = useState('members')

  if (!enabled) return <Intro onEnabled={() => setTab('levels')} />
  return (
    <DashPage title="Hội viên" desc="Thu nhập định kỳ từ những người muốn đồng hành cùng bạn lâu dài." tab={tab} onTab={setTab}
      tabs={[{ value: 'members', label: 'Hội viên', count: memberCount }, { value: 'levels', label: 'Hạng', count: levelCount }, { value: 'settings', label: 'Cài đặt' }]}>
      {tab === 'members' && <MembersTab onGoLevels={() => setTab('levels')} />}
      {tab === 'levels' && <LevelsTab />}
      {tab === 'settings' && <MembershipSettings />}
    </DashPage>
  )
}

/* ---------------- Chưa bật hội viên ---------------- */
const BENEFITS = [
  { icon: Repeat, title: 'Thu nhập định kỳ', desc: 'Biết trước mỗi tháng mình có bao nhiêu để yên tâm sáng tạo, không phụ thuộc vào từng lượt tặng hoa.' },
  { icon: Lock, title: 'Chia sẻ nội dung riêng', desc: 'Bài viết, bộ ảnh, tin nhắn chỉ hội viên xem được: bản nháp, hậu trường, tệp tải về.' },
  { icon: Sparkles, title: 'Nhiều hạng, nhiều quyền lợi', desc: 'Tự đặt tên, giá tháng, giá năm và quyền lợi cho từng hạng; đổi bất cứ lúc nào.' },
]

function Intro({ onEnabled }) {
  const mutate = useApp((s) => s.mutate)
  const hasLevels = useApp((s) => s.membership.levels.length > 0)
  const enable = () => {
    mutate((d) => {
      d.membership.enabled = true
      if (d.membership.levels.length === 0) {
        d.membership.levels.push({
          id: uid('lv'), name: 'Bạn đồng hành', price: 50000, yearly: 500000, art: randomArt(), limit: null, published: true,
          desc: 'Đồng hành cùng mình mỗi tháng và xem những nội dung chỉ dành cho hội viên.',
          rewards: [REWARD_TEMPLATES[0].title, REWARD_TEMPLATES[1].title, REWARD_TEMPLATES[6].title],
          welcome: 'Cảm ơn bạn đã trở thành hội viên! 🌸',
        })
      }
    })
    onEnabled()
    toast(hasLevels ? 'Đã bật hội viên' : { title: 'Đã bật hội viên', desc: 'Mình đã tạo sẵn một hạng mẫu, bạn sửa lại cho hợp ý nhé.' })
  }
  return (
    <DashPage title="Hội viên">
      <section className="card overflow-hidden">
        <div className="relative">
          <FlowerArt seed={12} variant="field" className="h-40 w-full sm:h-48" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
        </div>
        <div className="px-5 pb-7 sm:px-8 sm:pb-9 -mt-6 relative">
          <Badge tone="brand" icon={Repeat}>Thu nhập hằng tháng</Badge>
          <h2 className="mt-3 text-[24px] sm:text-[28px] font-[650] tracking-tight leading-tight text-fg">Biến người hâm mộ thành hội viên đồng hành</h2>
          <p className="mt-2 max-w-xl text-[14.5px] text-muted leading-relaxed">
            Hội viên ủng hộ bạn một khoản cố định mỗi tháng và nhận lại những quyền lợi riêng. Bạn chỉ cần vài phút để mở hạng đầu tiên.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl bg-subtle p-4">
                <span className="grid size-9 place-items-center rounded-xl bg-surface text-brand-ink"><b.icon size={18} /></span>
                <div className="mt-3 text-[14px] font-[600] text-fg">{b.title}</div>
                <p className="mt-1 text-[13px] text-muted leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" icon={Sparkles} onClick={enable}>Bật hội viên</Button>
            <span className="ds-caption">Phí nền tảng 5% trên mỗi khoản thu, không có phí cố định.</span>
          </div>
        </div>
      </section>
    </DashPage>
  )
}

/* ---------------- Tab: Hội viên ---------------- */
function MembersTab({ onGoLevels }) {
  const { levels, members, settings } = useApp((s) => s.membership)
  const supports = useApp((s) => s.supports)
  const mutate = useApp((s) => s.mutate)
  const [days, setDays] = useState(30)
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [openId, setOpenId] = useState(null)
  const [cancel, setCancel] = useState(null)

  const levelById = useMemo(() => Object.fromEntries(levels.map((l) => [l.id, l])), [levels])
  const active = members.filter((m) => m.status === 'active')
  const monthly = active.reduce((a, m) => a + (levelById[m.levelId]?.price || 0), 0)
  const allTime = useMemo(() => summarize(supports.filter(isMembership), 0).total, [supports])
  const series = useMemo(() => dailySeries(supports, days, isMembership), [supports, days])
  const periodTotal = series.reduce((a, p) => a + p.value, 0)

  const list = members.filter((m) => (!levelFilter || m.levelId === levelFilter) && matches(query, m.name, m.email))
  const open = members.find((m) => m.id === openId)
  const history = open?.email ? supports.filter((s) => s.email === open.email) : []

  const exportCsv = () => downloadCsv('hoi-vien.csv',
    ['Tên', 'Email', 'Hạng', 'Giá tháng (VND)', 'Trạng thái', 'Ngày tham gia'],
    list.map((m) => [m.name, m.email, levelById[m.levelId]?.name || '', m.status === 'gift' ? 0 : levelById[m.levelId]?.price || 0, statusOf(m, settings.paused).label, formatDate(m.since)]))

  const doCancel = () => {
    const m = cancel
    mutate((d) => { d.membership.members = d.membership.members.filter((x) => x.id !== m.id) })
    setOpenId(null)
    toast({ title: 'Đã huỷ tư cách hội viên', desc: `${m.name} sẽ không bị thu phí ở kỳ tiếp theo.` })
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Hội viên đang hoạt động" value={formatNumber(active.length)} icon={Users} />
        <StatTile label="Ước tính mỗi tháng" value={formatVND(monthly)} icon={CalendarClock} />
        <StatTile label="Toàn thời gian" value={formatVND(allTime)} icon={Wallet} />
      </div>

      <Section title="Thu từ hội viên" desc={<><span className="num font-[600] text-fg">{formatVND(periodTotal)}</span> trong {days} ngày qua</>}
        action={<Segmented size="sm" value={days} onChange={setDays} options={[{ value: 30, label: '30 ngày' }, { value: 90, label: '90 ngày' }]} />}>
        <AreaChart data={series} height={220} />
      </Section>

      <Section title="Danh sách hội viên" padded={false}
        action={members.length > 0 && <Button size="sm" variant="outline" icon={Download} onClick={exportCsv} disabled={!list.length}>Xuất CSV</Button>}>
        {members.length === 0 ? (
          <EmptyState icon={Users} title="Chưa có hội viên nào"
            desc="Khi có người tham gia một hạng của bạn, họ sẽ xuất hiện ở đây. Hãy kiểm tra các hạng và chia sẻ trang của bạn."
            action={<Button variant="primary" onClick={onGoLevels}>Xem các hạng</Button>} />
        ) : (
          <>
            <Toolbar className="px-5 sm:px-6 pt-4 pb-3">
              <SearchInput value={query} onChange={setQuery} placeholder="Tìm theo tên hoặc email" className="sm:max-w-xs" />
              <Select size="sm" className="sm:w-48 [&>div]:h-9" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
                placeholder="Tất cả các hạng" options={levels.map((l) => ({ value: l.id, label: l.name }))} />
              <span className="ds-caption sm:ml-auto">{formatNumber(list.length)} hội viên</span>
            </Toolbar>
            {list.length === 0 ? (
              <EmptyState compact title="Không có hội viên phù hợp" desc="Thử đổi từ khoá hoặc bộ lọc hạng." />
            ) : (
              <Table minWidth={600}>
                <THead><Th>Hội viên</Th><Th>Hạng</Th><Th>Trạng thái</Th><Th>Tham gia</Th><Th align="right">Mỗi tháng</Th></THead>
                <tbody>
                  {list.map((m) => {
                    const st = statusOf(m, settings.paused)
                    return (
                      <Tr key={m.id} onClick={() => setOpenId(m.id)}>
                        <Td className="max-w-[240px]"><Person name={m.name} color={m.avatarColor} sub={m.email} size={32} /></Td>
                        <Td>{levelById[m.levelId]?.name || '—'}</Td>
                        <Td><Badge tone={st.tone} dot>{st.label}</Badge></Td>
                        <Td className="text-muted num whitespace-nowrap">{formatDate(m.since)}</Td>
                        <Td align="right" className="num font-[550] whitespace-nowrap">{m.status === 'gift' ? <span className="font-normal text-faint">Miễn phí</span> : formatVND(levelById[m.levelId]?.price || 0)}</Td>
                      </Tr>
                    )
                  })}
                </tbody>
              </Table>
            )}
          </>
        )}
      </Section>

      <Modal open={!!open} onClose={() => setOpenId(null)} title="Chi tiết hội viên"
        footer={open && <>
          <Button variant="danger-soft" icon={UserMinus} className="mr-auto" onClick={() => setCancel(open)}>Huỷ tư cách hội viên</Button>
          <Button variant="secondary" onClick={() => setOpenId(null)}>Đóng</Button>
        </>}>
        {open && (
          <>
            <div className="flex items-center gap-3">
              <Avatar name={open.name} color={open.avatarColor} size={48} />
              <div className="min-w-0">
                <div className="ds-h2 truncate">{open.name}</div>
                <div className="ds-caption truncate">{open.email || 'Không có email'}</div>
              </div>
            </div>
            <KeyValue className="mt-3" items={[
              { label: 'Ngày tham gia', value: formatDate(open.since) },
              { label: 'Hạng', value: levelById[open.levelId] ? `${levelById[open.levelId].name} · ${formatVND(levelById[open.levelId].price)}/tháng` : '—' },
              { label: 'Trạng thái', value: (() => { const st = statusOf(open, settings.paused); return <Badge tone={st.tone} dot>{st.label}</Badge> })() },
            ]} />
            <div className="mt-4 ds-label">Lịch sử thanh toán</div>
            {history.length === 0 ? (
              <p className="mt-2 text-[13.5px] text-faint">{open.status === 'gift' ? 'Tư cách hội viên này được bạn tặng nên chưa có khoản thanh toán nào.' : 'Chưa có khoản thanh toán nào.'}</p>
            ) : (
              <ul className="mt-1">
                {history.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
                    <div className="min-w-0">
                      <div className="text-[13.5px] text-fg truncate">{SUPPORT_LABEL[s.type] || 'Ủng hộ'}{s.type === 'membership' && levelById[s.levelId] ? ` · hạng ${levelById[s.levelId].name}` : ''}</div>
                      <div className="ds-caption num">{formatDate(s.at)}</div>
                    </div>
                    <span className="num text-[13.5px] font-[600]">{formatVND(s.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Modal>
      <Confirm open={!!cancel} onClose={() => setCancel(null)} onConfirm={doCancel} danger confirmLabel="Huỷ tư cách" cancelLabel="Giữ lại"
        title="Huỷ tư cách hội viên?" desc={cancel ? `${cancel.name} sẽ mất quyền xem nội dung dành cho hội viên và không bị thu phí nữa.` : ''} />
    </>
  )
}

/* ---------------- Tab: Hạng ---------------- */
function LevelsTab() {
  const { levels, members, settings } = useApp((s) => s.membership)
  const username = useApp((s) => s.page.username)
  const [editor, setEditor] = useState(null) // { level } | null
  const [created, setCreated] = useState(null)
  const countOf = (id) => members.filter((m) => m.levelId === id).length

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] text-muted">{levels.length ? `${levels.length} hạng · sắp theo thứ tự hiển thị trên trang của bạn` : 'Bạn chưa có hạng nào.'}</p>
        <Button variant="primary" icon={Plus} onClick={() => setEditor({ level: null })}>Thêm hạng</Button>
      </div>

      {levels.length === 0 ? (
        <Section>
          <EmptyState icon={Sparkles} title="Tạo hạng hội viên đầu tiên"
            desc="Một hạng gồm tên, giá mỗi tháng và những quyền lợi hội viên nhận được. Bắt đầu với một hạng giá nhẹ nhàng là đủ."
            action={<Button variant="primary" icon={Plus} onClick={() => setEditor({ level: null })}>Thêm hạng</Button>} />
        </Section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {levels.map((lv) => {
            const until = pauseUntil(settings.paused, lv.id)
            return (
              <LevelCard key={lv.id} level={lv} annual={settings.annual} memberCount={countOf(lv.id)}
                badge={!lv.published ? <Badge tone="warn">Chưa công bố</Badge> : until ? <Badge tone="info">Tạm dừng</Badge> : null}
                footer={(
                  <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-muted"><Users size={14} /><span className="num font-[600] text-fg">{formatNumber(countOf(lv.id))}</span> hội viên</span>
                    <Button size="sm" variant="outline" icon={Pencil} onClick={() => setEditor({ level: lv })}>Sửa</Button>
                  </div>
                )} />
            )
          })}
        </div>
      )}

      {editor && <LevelEditor key={editor.level?.id || 'new'} level={editor.level} onClose={() => setEditor(null)} onCreated={setCreated} />}

      <Modal open={!!created} onClose={() => setCreated(null)} size="sm" hideClose>
        {created && (
          <div className="pt-2 text-center">
            <div className="mx-auto flex w-fit items-end gap-1">
              <Flower kind="mai" size={24} /><Flower kind="dao" size={48} spin /><Flower kind="luuly" size={24} />
            </div>
            <h2 className="mt-4 ds-h1">Chúc mừng!</h2>
            <p className="mt-1.5 text-[14px] text-muted">
              Hạng <b className="text-fg">“{created.name}”</b> với giá <span className="num">{formatVND(created.price)}</span>/tháng đã sẵn sàng đón hội viên. Hãy chia sẻ trang để mọi người biết nhé.
            </p>
            <CopyLink url={`${DOMAIN}/${username}`} className="mt-5 text-left" />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="outline" icon={ExternalLink} to={`/${username}`}>Xem trang của tôi</Button>
              <Button variant="secondary" onClick={() => setCreated(null)}>Để sau</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
